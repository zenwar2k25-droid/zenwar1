const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'mechanic'], required: true },
  avatarUrl: { type: String },
  tenantDomain: { type: String },
  businessId: { type: String },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
