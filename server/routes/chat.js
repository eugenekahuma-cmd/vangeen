const express = require('express');
const router = express.Router();

const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiService');
const { getHistory, saveMessage } = require('../services/memory');

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userId = req.user?.id || "guest";

    // ✅ SAVE USER INPUT
    await saveMessage(userId, 'user', message);

    // ✅ ORCHESTRATE
    const result = await orchestrate(message, userId);

    let reply;

    // ---------------- FINANCE ----------------
    if (result.type === "finance_result") {
      const d = result.data;

      const history = await getHistory(userId);

      const explanation = await callAI(
        `Explain financial results:\n${JSON.stringify(d)}`,
        history
      );

      reply = `
NPV: ${d.results[0].value.toFixed(2)}
IRR: ${d.results[1].value ? (d.results[1].value * 100).toFixed(2) + '%' : 'N/A'}
Payback: ${d.results[2].value ?? 'Not recovered'}

${explanation}
      `;
    }

    else if (result.type === "error") {
      reply = result.data;
    }

    else {
      const history = await getHistory(userId);
      reply = await callAI(message, history);
    }

    // ✅ SAVE RESPONSE
    await saveMessage(userId, 'assistant', reply);

    return res.json({ reply });

  } catch (err) {
    console.error("Chat Error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

module.exports = router;