const mongoose = require('mongoose');

const WebsiteStateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // 'draft' or 'live'
  state: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('WebsiteState', WebsiteStateSchema);
