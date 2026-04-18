const express = require('express');
const router = express.Router();

const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiService');

// ✅ OPTIONAL: only if you want AI explanations to use memory
const { getHistory } = require('../services/memory');

router.post('/', async (req, res) => {
  const { message } = req.body;

  // 🔥 CRITICAL: attach user identity (replace with real auth later)
  const userId = req.user?.id || "demo-user";

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  try {
    const result = await orchestrate(message, userId);

    // ---------------- FINANCE OUTPUT ----------------
    if (result.type === "finance_result") {
      const d = result.data;

      // ✅ pull memory for better explanation continuity
      const history = getHistory(userId);

      const explanation = await callAI(
        `
Explain only. Do NOT recalculate.

Structure strictly:
1. Interpretation of NPV
2. Interpretation of IRR vs discount rate
3. Payback insight
4. Final decision logic

Data:
${JSON.stringify(d, null, 2)}
        `,
        history
      );

      return res.json({
        reply: `
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
  if (r.type === "irr" && r.value !== null) {
    return `IRR: ${(r.value * 100).toFixed(2)}%`;
  }
  if (r.type === "npv") {
    return `NPV: ${r.value.toFixed(2)}`;
  }
  if (r.type === "payback") {
    return `Payback: ${r.value !== null ? r.value + ' years' : 'Not recovered'}`;
  }
  return `${r.type}: ${r.value}`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━
INSIGHT
━━━━━━━━━━━━━━━━━━
${explanation}
        `
      });
    }

    // ---------------- ERROR ----------------
    if (result.type === "error") {
      return res.json({ reply: result.data });
    }

    // ---------------- DEFAULT ----------------
    return res.json({
      reply: result.data
    });

  } catch (err) {
    console.error("Chat Route Error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

module.exports = router;