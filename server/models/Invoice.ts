const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jobId: { type: String, required: true },
  tenantDomain: { type: String, required: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'partially_paid'], default: 'unpaid' },
  items: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Invoice', InvoiceSchema);
