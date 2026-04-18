const express = require('express');
const router = express.Router();

const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiService');
const { getHistory, saveMessage } = require('../services/memory');

// ---------------- AUTH MIDDLEWARE ----------------
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { message } = req.body;

  // 🔥 REAL USER FROM JWT
  const userId = req.user.id;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  try {
    // ---------------- SAVE USER MESSAGE (MEMORY WRITE) ----------------
    await saveMessage(userId, 'user', message);

    // ---------------- ORCHESTRATE INTENT ----------------
    const result = await orchestrate(message);

    let reply;

    // ---------------- FINANCE OUTPUT ----------------
    if (result.type === "finance_result") {
      const d = result.data;

      const history = await getHistory(userId);

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

    // ---------------- SAVE ASSISTANT RESPONSE (MEMORY WRITE) ----------------
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