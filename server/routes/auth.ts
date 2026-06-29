const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { tenantDomain, email, password } = req.body;
  
  try {
    // Basic mock auth logic adapted for mongo
    // Normally you would hash passwords and use JWT
    
    // Check if superadmin
    if (tenantDomain === 'SYSTEM' && email === 'zenwar_admin' && password === 'Smart@123') {
      let user = await User.findOne({ email: 'zenwar_admin' });
      if (!user) {
        user = await User.create({
          id: 'u-sa-1',
          name: 'Super Admin',
          email: 'zenwar_admin',
          role: 'superadmin',
          tenantDomain: 'SYSTEM'
        });
      }
      return res.json({ success: true, user });
    }

    // Check if workshop admin (mock check)
    if (email === 'workshop_admin' && password === 'Business@123') {
      let user = await User.findOne({ email: 'workshop_admin', tenantDomain });
      if (!user) {
        user = await User.create({
          id: `u-${tenantDomain}-admin`,
          name: 'Workshop Owner',
          email: 'workshop_admin',
          role: 'admin',
          tenantDomain
        });
      }
      return res.json({ success: true, user });
    }

    // Check if staff (mock check)
    if (email === 'staff_user' && password === 'Staff@123') {
      let user = await User.findOne({ email: 'staff_user', tenantDomain });
      if (!user) {
        user = await User.create({
          id: `u-${tenantDomain}-staff`,
          name: 'Staff Member',
          email: 'staff_user',
          role: 'mechanic',
          tenantDomain
        });
      }
      return res.json({ success: true, user });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');
import { getEnvConfig } from '../utils/envValidator';
// Note: We are phasing out GoogleOAuthSettings DB model in favor of .env
const GoogleOAuthSettings = require('../models/GoogleOAuthSettings');

// GET /api/auth/google-config
router.get('/google-config', async (req, res) => {
  try {
    const config = getEnvConfig();
    return res.json({
      success: true,
      config: {
        enabled: config.enabled,
        clientId: config.clientId,
        redirectUri: config.callbackUrl,
        reason: config.reason
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/google-config
router.post('/google-config', async (req, res) => {
  const { clientId, clientSecret, redirectUri, enabled } = req.body;
  try {
    let settings = await GoogleOAuthSettings.findOne();
    if (!settings) {
      settings = new GoogleOAuthSettings();
    }
    settings.clientId = clientId;
    settings.clientSecret = clientSecret;
    settings.redirectUri = redirectUri;
    settings.enabled = enabled;
    await settings.save();
    return res.json({ success: true, message: 'Google OAuth settings saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { code } = req.body;
  console.log('\n--- OAUTH FLOW DEBUG ---');
  console.log('Google Login Started\n↓');

  if (!code) {
    console.log('Error: No authorization code provided');
    return res.status(400).json({ success: false, message: 'No authorization code provided' });
  }

  console.log('Authorization Code Received\n↓');

  try {
    // 1. VERIFY ENVIRONMENT VARIABLES
    const config = getEnvConfig();
    
    // Prioritize DB settings, fallback to ENV
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const redirectUri = config.callbackUrl;
    const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'default_jwt_secret';
    const dbUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;

    console.log('Client ID Loaded:', !!clientId);
    console.log('Client Secret Available:', !!clientSecret ? 'YES' : 'NO');
    console.log('Redirect URI:', redirectUri);
    console.log('Environment:', process.env.NODE_ENV || 'development');

    if (!clientId) return res.status(500).json({ success: false, message: 'Google token verification failed\n\nReason:\nmissing_client_id\n\nDescription:\nGoogle Client ID is missing.' });
    if (!clientSecret) return res.status(500).json({ success: false, message: 'Google token verification failed\n\nReason:\ninvalid_client\n\nDescription:\nGoogle Client Secret is invalid.' });
    if (!dbUrl) return res.status(500).json({ success: false, message: 'Internal Authentication Error\n\nReason:\nmissing_database_url' });

    console.log('Access Token Request Started\n↓');

    // 2. EXCHANGE CODE & VERIFY TOKEN
    let tokens, ticket;
    try {
      const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
      const tokenResponse = await oAuth2Client.getToken(code);
      tokens = tokenResponse.tokens;
      oAuth2Client.setCredentials(tokens);
      console.log('Access Token Received\n↓');
      console.log('ID Token Verification Started\n↓');
      
      ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
    } catch (err) {
      console.log('Token Exchange / Verification Failed:', err.message);
      if (err.message && err.message.includes('redirect_uri_mismatch')) {
        return res.status(400).json({ success: false, message: 'Redirect URI mismatch\n\nEnsure authorized redirect URIs in Google Console match.' });
      }
      return res.status(401).json({ success: false, message: `Google token verification failed\n\nReason:\n${err.message}` });
    }

    const payload = ticket.getPayload();
    const { email, name, sub: uid, picture, email_verified } = payload;

    console.log(`Google User Email:\n${email}\n↓`);
    console.log(`Google User ID:\n${uid}`);
    console.log(`Email Verified:\n${email_verified}`);
    console.log(`Picture URL:\n${picture}\n↓`);

    console.log('Searching Database...\n↓');
    console.log('Searching Super Admin...');
    console.log('Searching Business Owners...');
    console.log('Searching Staff...');

    // 3. DATABASE LOOKUP
    const rolePriority = { superadmin: 1, admin: 2, mechanic: 3 };
    const users = await User.find({ email });
    if (!users || users.length === 0) {
      console.log('No matching email found.\n');
      return res.status(404).json({ success: false, message: `User not found\n\nEmail:\n${email}` });
    }

    // Match using Order: Super Admin Users, Business Owners, Business Admins, Staff Users
    users.sort((a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99));
    const user = users[0];

    console.log('User Found\n↓');
    console.log(`Role:\n${user.role === 'admin' ? 'Business Owner/Admin' : user.role === 'superadmin' ? 'Super Admin' : 'Staff'}\n↓`);
    console.log(`Tenant:\n${user.tenantDomain}\n↓`);

    // Check account status if applicable
    if (user.role === 'admin' && user.tenantDomain) {
      const business = await Business.findOne({ tenantDomain: user.tenantDomain });
      if (business) {
        if (business.status === 'suspended') {
          console.log(`Business Suspended for ${email}`);
          return res.status(403).json({ success: false, message: `Business suspended\n\nTenant:\n${user.tenantDomain}` });
        }
      }
    }

    console.log('Creating Session\n↓');

    // 4. SESSION CREATION
    let token;
    try {
      token = jwt.sign({
        id: user.id,
        role: user.role,
        tenantDomain: user.tenantDomain,
        businessId: user.businessId,
        email: user.email
      }, jwtSecret, { expiresIn: '24h' });
      console.log('JWT Created');
      console.log('Session Created');
    } catch (sessionErr) {
      console.log('Session creation failed:', sessionErr.message);
      return res.status(500).json({ success: false, message: `Internal Authentication Error\n\nReason:\nSession creation failed - ${sessionErr.message}` });
    }

    let redirectTarget = '/dashboard';
    if (user.role === 'superadmin') redirectTarget = '/super-admin';

    console.log('Redirecting Dashboard');
    console.log(`Redirect URL: ${redirectTarget}`);
    console.log('--- END OAUTH FLOW ---\n');

    const userResponse = {
      ...user.toObject(),
      isGoogleAuth: true,
      email,
      name,
      picture,
      token
    };

    return res.json({ success: true, user: userResponse, token, redirectTarget });
  } catch (err) {
    console.error('Internal Authentication Error:\n', err.stack);
    return res.status(500).json({ success: false, message: `Internal Authentication Error\n\nReason:\n${err.message}` });
  }
});

// GET /api/auth/debug
router.get('/debug', async (req, res) => {
  console.log('Callback URL Hit\nYES');
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'postmessage';
  
  res.json({
    clientIdLoaded: !!clientId,
    clientSecretLoaded: !!clientSecret,
    redirectUri: redirectUri,
    callbackWorking: true,
    dbConnected: require('mongoose').connection.readyState === 1,
    environment: process.env.NODE_ENV || 'development'
  });
});

// POST /api/auth/test-google
router.post('/test-google', async (req, res) => {
  const config = getEnvConfig();
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;
  const redirectUri = config.callbackUrl;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  
  try {
    // Just verifying format here because we can't do a full OAuth flow without a browser
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      return res.json({ success: false, message: 'Invalid Client ID format' });
    }
    if (clientSecret.length < 15) {
      return res.json({ success: false, message: 'Invalid Client Secret format' });
    }
    
    // We can also create an OAuth2Client to ensure it doesn't throw
    const testClient = new OAuth2Client(clientId, clientSecret, redirectUri || 'postmessage');
    
    return res.json({ success: true, message: 'Credentials format valid' });
  } catch (err) {
    console.error('Test Error:', err);
    return res.status(500).json({ success: false, message: 'Server error testing credentials' });
  }
});

module.exports = router;

