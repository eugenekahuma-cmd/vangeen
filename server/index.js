const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// connect database FIRST
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- ROUTES ----------------
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

// ---------------- HEALTH CHECK ----------------
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Vangeen AI Server is running'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});