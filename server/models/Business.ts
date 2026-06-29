const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  invoicesCount: { type: Number, default: 0 },
  storageMb: { type: Number, default: 0 },
  smsSent: { type: Number, default: 0 },
  whatsappSent: { type: Number, default: 0 }
}, { _id: false });

const BusinessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  plan: { type: String, enum: ['starter', 'growth', 'enterprise'], required: true },
  status: { type: String, enum: ['active', 'suspended', 'trial'], default: 'active' },
  tenantDomain: { type: String, required: true, unique: true },
  joinDate: { type: Date, default: Date.now },
  storageLimit: { type: Number, default: 1000 },
  invoicesLimit: { type: Number, default: 500 },
  usage: { type: UsageSchema, default: () => ({}) }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', BusinessSchema);
