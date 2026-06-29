const mongoose = require('mongoose');

const googleOAuthSettingsSchema = new mongoose.Schema({
  clientId: {
    type: String,
    trim: true,
    required: false
  },
  clientSecret: {
    type: String,
    trim: true,
    required: false
  },
  redirectUri: {
    type: String,
    trim: true,
    required: false
  },
  enabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GoogleOAuthSettings', googleOAuthSettingsSchema);
