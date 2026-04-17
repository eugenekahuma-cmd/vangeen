const express = require('express');
const router = express.Router();
const { orchestrate } = require('../services/orchestrator');

router.post('/', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await orchestrate(message, history || []);
    res.json(result);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;