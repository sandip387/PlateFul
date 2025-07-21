const express = require('express');
const router = express.Router();
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET all categories with their associated menu items
router.get('/', async (req, res) => {
    try {
        const categories = await MenuCategory.find().sort({ order: 1 });
        const menuItems = await MenuItem.find({ isAvailable: true });

        const populatedCategories = categories.map(category => {
            const items = menuItems.filter(item => {
                return item.subCategory === category.slug;
            });
            return {
                ...category.toObject(),
                items: items
            };
        });

        res.json({ success: true, data: populatedCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

//Admin routes
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const newCategory = new MenuCategory(req.body);
        await newCategory.save();
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const category = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        await MenuCategory.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;