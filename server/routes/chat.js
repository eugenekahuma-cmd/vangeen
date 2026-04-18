const express = require('express');
const router = express.Router();
const { orchestrate } = require('../services/orchestrator');

router.post('/', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required'
    });
  }

  try {
    console.log("Incoming:", message);

    const result = await orchestrate(message, history || []);

    // 🔥 FORCE STANDARD RESPONSE FORMAT
    res.json({
      reply: result?.reply || "No response generated"
    });

  } catch (error) {
    console.error("Server Error:", error);

    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;