const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Load .env from root
import { validateEnv } from './utils/envValidator';

// Run validation immediately
global.googleAuthEnabled = validateEnv();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const cmsRoutes = require('./routes/cms');
const businessesRoutes = require('./routes/businesses');
const jobsRoutes = require('./routes/jobs');
import chatbotRoutes from './routes/chatbot';

app.use('/api/auth', authRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenwar';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err: any) => {
    console.error('❌ MongoDB connection error:', err);
  });

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
