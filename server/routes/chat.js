const express = require('express');
const router = express.Router();

const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiGateway'); // 🔥 use gateway
const { getHistory, saveMessage } = require('../services/memory');

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userId = req.user?.id || "guest";

    // ✅ save user input
    await saveMessage(userId, 'user', message);

    const result = await orchestrate(message, userId);

    let reply = "";

    // ================= FINANCE =================
    if (result.type === "finance_result") {
      const d = result.data;

      const history = await getHistory(userId);

      const cleanHistory = history
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-6);

      const explanation = await callAI(
        `
You are a financial analyst.

STRICT RULES:
- DO NOT recalculate
- DO NOT change numbers
- ONLY explain

DATA:
${JSON.stringify(d)}
        `,
        cleanHistory
      );

      const npv = d.results.find(r => r.type === "npv")?.value;
      const irr = d.results.find(r => r.type === "irr")?.value;
      const payback = d.results.find(r => r.type === "payback")?.value;

      reply = 
`NPV: ${npv}
IRR: ${irr !== null ? (irr * 100).toFixed(2) + "%" : "N/A"}
Payback: ${payback !== null ? payback + " years" : "N/A"}

${explanation}`;
    }

    // ================= GENERAL =================
    else if (result.type === "general") {
      const history = await getHistory(userId);

      const cleanHistory = history
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-10);

      reply = await callAI(message, cleanHistory);
    }

    // ================= ERROR =================
    else {
      reply = result.data || "Unexpected response";
    }

    // ✅ save assistant response
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