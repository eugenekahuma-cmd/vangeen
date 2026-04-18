const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // 🔥 ADD THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 CONNECT TO MONGODB
connectDB();

// 🔥 STRONGER CORS
app.use(cors({
  origin: '*', // later restrict to your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

// Routes
const chatRoute = require('./routes/chat');
app.use('/chat', chatRoute);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Vangeen AI Server is running'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});