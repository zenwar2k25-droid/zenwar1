const express = require('express');
const router = express.Router();
const WebsiteState = require('../models/WebsiteState');

// GET /api/cms/:id (id is 'draft' or 'live')
router.get('/:id', async (req, res) => {
  try {
    const stateDoc = await WebsiteState.findOne({ id: req.params.id });
    if (!stateDoc) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    res.json({ success: true, state: stateDoc.state });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/cms/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedState = req.body;
    const stateDoc = await WebsiteState.findOneAndUpdate(
      { id: req.params.id },
      { state: updatedState, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, state: stateDoc.state });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
