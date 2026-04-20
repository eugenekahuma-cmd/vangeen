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

  // ---------------- FINANCE ENGINE ----------------
if (result.type === "finance_result") {
  const d = result.data;

  const history = await getHistory(userId);

  const explanation = await callAI(
    `
You are a financial analyst.

STRICT RULES:
- DO NOT recalculate anything
- DO NOT modify ANY numbers
- USE numbers exactly as given
- If unsure, say: "Assuming provided results are correct"

Explain clearly:
1. NPV meaning
2. IRR vs discount rate
3. Payback insight
4. Decision logic

DATA (DO NOT CHANGE):
${JSON.stringify(d, null, 2)}
    `,
    history
  );

  reply = `
NPV: ${Number(d.results.find(r => r.type === "npv")?.value).toFixed(2)}
IRR: ${d.results.find(r => r.type === "irr")?.value !== null
      ? (d.results.find(r => r.type === "irr").value * 100).toFixed(2) + '%'
      : 'N/A'}
Payback: ${d.results.find(r => r.type === "payback")?.value ?? 'N/A'}

${explanation}
  `;
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