const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- SIGN TOKEN ----------------
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ---------------- VERIFY TOKEN ----------------
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ---------------- HASH PASSWORD ----------------
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// ---------------- COMPARE PASSWORD ----------------
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};