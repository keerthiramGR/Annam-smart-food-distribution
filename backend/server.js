/**
 * Annam - Smart Food Distribution and Food Waste Reduction System
 * Main Express.js Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const routingRoutes = require('./routes/routingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend serving
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'Annam - Smart Food Distribution System',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback to frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Annam Server Error]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🍛 Annam - Smart Food Distribution Server running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📦 Node.js: ${process.version}`);
    console.log(`⚡ Ready for Donor, Recipient, and Super Admin actions`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
