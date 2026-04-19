const express = require('express');
const router = express.Router();

const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiService');
const { getHistory, saveMessage } = require('../services/memory');

// OPTIONAL AUTH (disabled for early stage)
const authMiddleware = require('../middleware/authMiddleware');

// ---------------- CHAT ROUTE ----------------
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  try {
    // ---------------- USER ID (TEMP FALLBACK) ----------------
    const userId = req.user?.id || "guest";

    // ---------------- SAVE USER MESSAGE ----------------
    await saveMessage(userId, 'user', message);

    // ---------------- ORCHESTRATE ----------------
    const result = await orchestrate(message);

    let reply;

    // ---------------- FINANCE ENGINE ----------------
    if (result.type === "finance_result") {
      const d = result.data;

      const history = await getHistory(userId);

      const explanation = await callAI(
        `
Explain only. Do NOT recalculate.

Structure:
1. NPV interpretation
2. IRR interpretation
3. Payback logic
4. Decision summary

Data:
${JSON.stringify(d, null, 2)}
        `,
        history
      );

      reply = `
📊 FINANCIAL ANALYSIS

━━━━━━━━━━━━━━━━━━
INPUTS
━━━━━━━━━━━━━━━━━━
Initial Investment: ${d.initial}
Discount Rate: ${(d.rate * 100).toFixed(2)}%
Cash Flows: ${d.cashFlows.join(', ')}

━━━━━━━━━━━━━━━━━━
RESULTS
━━━━━━━━━━━━━━━━━━
${d.results.map(r => {
        if (r.type === "npv") return `NPV: ${Number(r.value).toFixed(2)}`;
        if (r.type === "irr" && r.value !== null) return `IRR: ${(r.value * 100).toFixed(2)}%`;
        if (r.type === "payback") return `Payback: ${r.value !== null ? r.value + ' years' : 'Not recovered'}`;
        return `${r.type}: ${r.value}`;
      }).join('\n')}

━━━━━━━━━━━━━━━━━━
INSIGHT
━━━━━━━━━━━━━━━━━━
${explanation}
      `;
    }

    // ---------------- ERROR ----------------
    else if (result.type === "error") {
      reply = result.data;
    }

    // ---------------- DEFAULT ----------------
    else {
      reply = result.data;
    }

    // ---------------- SAVE ASSISTANT ----------------
    await saveMessage(userId, 'assistant', reply);

    return res.json({ reply });

  } catch (err) {
    console.error("Chat Route Error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

module.exports = router;