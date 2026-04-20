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

    await saveMessage(userId, 'user', message);

    const result = await orchestrate(message, userId);

    let reply;

    // ================= FINANCE =================
    if (result.type === "finance_result") {
      const d = result.data;

      const history = await getHistory(userId);

      const explanation = await callAI(
        `Explain ONLY. Do NOT recalculate.\n\nDATA:\n${JSON.stringify(d)}`,
        history
      );

      const npv = d.results.find(r => r.type === "npv")?.value ?? null;
      const irr = d.results.find(r => r.type === "irr")?.value;
      const payback = d.results.find(r => r.type === "payback")?.value;

      reply = `
NPV: ${npv}
IRR: ${irr !== null && irr !== undefined ? (irr * 100).toFixed(2) + '%' : 'N/A'}
Payback: ${payback !== null && payback !== undefined ? payback + ' years' : 'N/A'}

${explanation}
      `.trim();
    }

    // ================= GENERAL =================
    else if (result.type === "general") {
      const history = await getHistory(userId);
      reply = await callAI(message, history);
    }

    else {
      reply = result.data;
    }

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