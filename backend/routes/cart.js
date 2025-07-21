const express = require('express');
const Cart = require('../models/Cart.js');
const { authenticateToken } = require('../middleware/auth.js');
const MenuItem = require('../models/MenuItem.js');
const router = express.Router();

// GET user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem', 'name image price');
        if (!cart) {
            return res.json({ success: true, data: { items: [], total: 0 } });
        }
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// POST add/update item in cart
router.post('/', authenticateToken, async (req, res) => {
    const { menuItemId, quantity } = req.body;

    try {
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
            return res.status(404).json({ success: false, message: 'Menu item not found or unavailable' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.menuItem.toString() === menuItemId);

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Add new item
            cart.items.push({ menuItem: menuItemId, quantity, price: menuItem.getCurrentPrice() });
        }

        // Remove items with zero quantity
        cart.items = cart.items.filter(item => item.quantity > 0);

        await cart.save();
        const populatedCart = await cart.populate('items.menuItem', 'name image price');

        res.status(200).json({ success: true, message: 'Cart updated successfully', data: populatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.delete('/', authenticateToken, async (req, res) => {
    try {
        await Cart.findOneAndRemove({ user: req.user._id });
        res.json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;