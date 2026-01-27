/**
 * StockPlay Backend Server
 * Clean, modular Express application with API versioning
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Config
const { connectDB } = require('./config/database');

// Middleware
const { requestLogger, errorHandler } = require('./middleware/logging');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const tradeRoutes = require('./routes/tradeRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const stockRoutes = require('./routes/stockRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = 'v1';

// =========================
// MIDDLEWARE
// =========================

// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use(requestLogger);

// Global rate limiting (applies to all API routes)
app.use('/api', apiLimiter);

// Serve static files (production)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// =========================
// API ROUTES (Versioned)
// =========================

// Versioned routes (recommended for new integrations)
app.use(`/api/${API_VERSION}`, tradeRoutes);
app.use(`/api/${API_VERSION}/watchlist`, watchlistRoutes);
app.use(`/api/${API_VERSION}`, stockRoutes);
app.use(`/api/${API_VERSION}/recommendations`, recommendationRoutes);

// Legacy routes (backward compatibility - mounted at /api)
app.use('/api', tradeRoutes);
app.use('/api', watchlistRoutes);
app.use('/api', stockRoutes);

// API version info endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: API_VERSION,
    name: 'StockPlay API',
    endpoints: {
      versioned: `/api/${API_VERSION}`,
      legacy: '/api'
    }
  });
});

// =========================
// CATCH-ALL & ERROR HANDLING
// =========================

// Serve React app for client-side routing (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling
app.use(errorHandler);

// =========================
// START SERVER
// =========================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Version: ${API_VERSION}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
