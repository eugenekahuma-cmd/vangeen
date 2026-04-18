const express = require('express');
const router = express.Router();

const User = require('../models/User');
const {
  generateToken,
  hashPassword,
  comparePassword
} = require('../services/auth');

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const hashed = await hashPassword(password);

  const user = await User.create({
    email,
    password: hashed
  });

  const token = generateToken(user);

  res.json({
    token,
    userId: user._id
  });
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await comparePassword(password, user.password);

  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = generateToken(user);

  res.json({
    token,
    userId: user._id
  });
});

module.exports = router;