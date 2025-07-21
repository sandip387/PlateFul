const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/email');
const LocationService = require('../services/locationService');
const mongoose = require('mongoose')

const router = express.Router();

// validation middleware for order
const validateOrder = [
  body('customerInfo.firstName').notEmpty().withMessage('First name is required').trim(),
  body('customerInfo.lastName').notEmpty().withMessage('Last name is required').trim(),
  body('customerInfo.email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('customerInfo.phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('customerInfo.address').notEmpty().withMessage('Address is required').trim(),
  body('items').isArray({ min: 1 }).withMessage('At least one item must be ordered'),
  body('items.*.menuItem').isMongoId().withMessage('Invalid menu item ID'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
  body('scheduledFor.date').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledFor.time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid scheduled time is required'),
];


// Create new order
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const { customerInfo, items, scheduledFor, specialInstructions, referralCode, couponCode, paymentMethod } = req.body;
    const customer = req.user;

    console.log(`[POST /api/orders] Received order request from user: ${customer.id}`);

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Menu item is not available.` });
      }
      const currentPrice = menuItem.getCurrentPrice();
      const itemSubtotal = currentPrice * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({ menuItem: menuItem._id, name: menuItem.name, price: currentPrice, quantity: item.quantity, subtotal: itemSubtotal });
    }

    let deliveryFee = 50;
    if (customerInfo.coordinates) {
      const deliveryInfo = LocationService.getDeliveryInfo(customerInfo.coordinates.latitude, customerInfo.coordinates.longitude, subtotal);
      if (deliveryInfo.success && deliveryInfo.canDeliver) deliveryFee = deliveryInfo.fee;
      else if (deliveryInfo.success && !deliveryInfo.canDeliver) return res.status(400).json({ success: false, message: deliveryInfo.message });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiresAt >= new Date() && subtotal >= coupon.minOrderAmount) {
        discount = coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
      }
    }

    const tax = (subtotal - discount) * 0.13;
    const total = subtotal - discount + tax + deliveryFee;

    const order = new Order({
      customer: customer._id,
      customerInfo,
      items: orderItems,
      scheduledFor,
      specialInstructions,
      referralCode,
      paymentMethod,
      pricing: { subtotal, tax, deliveryFee, discount, total },
    });

    order.calculateEstimatedDeliveryTime();
    const savedOrder = await order.save();

    console.log(`[POST /api/orders] Successfully saved order ${savedOrder.orderNumber} for customer ${savedOrder.customer}`);

    const userCart = await Cart.findOne({ user: customer._id });
    if (userCart) {
      userCart.items = [];
      await userCart.save();
    }

    try { await sendOrderConfirmationEmail(customer.email, savedOrder); }
    catch (emailError) { console.error('Failed to send order confirmation email:', emailError); }

    res.status(201).json({ success: true, message: 'Order placed successfully', data: savedOrder });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get customer's own orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[GET /api/orders/my-orders] Fetching orders for user ID: ${userId}`);
    const query = { customer: new mongoose.Types.ObjectId(userId) };

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name category image')
      .sort({ createdAt: -1 });

    console.log(`[GET /api/orders/my-orders] Found ${orders.length} orders for user ID: ${userId}`);

    res.json({
      success: true,
      data: { orders }, // Simplified for now, pagination can be added back later
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Get order by order number (for user or admin)
router.get('/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.menuItem', 'name category image')
      .populate('customer', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.patch('/:orderNumber/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status, statusMessage } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.updateStatus(status, statusMessage);

    const customer = await User.findById(order.customer);
    if (customer && customer.email) {
      try {
        await sendOrderStatusUpdateEmail(customer.email, order, status);
      } catch (emailError) {
        console.error(`Failed to send status update email for order ${order.orderNumber}:`, emailError);
      }
    }

    res.json({ success: true, message: 'Order status updated successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Cancel order (by user)
router.patch('/:orderNumber/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderNumber, customer: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or you are not the owner' });
    }
    if (!order.canBeCancelled()) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

module.exports = router;
