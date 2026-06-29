const express = require('express');
const router = express.Router();
const Business = require('../models/Business');

// GET /api/businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find({});
    res.json({ success: true, businesses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/businesses
router.post('/', async (req, res) => {
  try {
    const business = await Business.create(req.body);
    res.json({ success: true, business });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/businesses/:tenantDomain
router.get('/:tenantDomain', async (req, res) => {
  try {
    const business = await Business.findOne({ tenantDomain: req.params.tenantDomain });
    if (!business) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, business });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/businesses/:id
router.put('/:id', async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json({ success: true, business });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
