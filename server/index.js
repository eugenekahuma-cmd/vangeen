const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // prevent abuse

// Routes
const chatRoute = require('./routes/chat');
app.use('/api/chat', chatRoute);

// Health check route (important for debugging + deployment)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Vangeen AI Server is running',
    timestamp: new Date().toISOString()
  });
});

// Catch unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Global error handler (prevents crashes)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('===================================');
  console.log(`🚀 Vangeen Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('===================================');
});