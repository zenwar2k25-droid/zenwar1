const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantDomain: { type: String, required: true },
  customerName: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'delivered'], default: 'pending' },
  assignedMechanic: { type: String },
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false }); // strict false allows flexibility

module.exports = mongoose.model('Job', JobSchema);
