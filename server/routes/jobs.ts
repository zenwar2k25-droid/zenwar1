const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /api/jobs/:tenantDomain
router.get('/:tenantDomain', async (req, res) => {
  try {
    const jobs = await Job.find({ tenantDomain: req.params.tenantDomain }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/jobs
router.post('/', async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
