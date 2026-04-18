const express = require('express');
const router = express.Router();
const { orchestrate } = require('../services/orchestrator');
const { callAI } = require('../services/aiService');

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const result = await orchestrate(message);

    // ---------------- FINANCE OUTPUT ----------------
    if (result.type === "finance_result") {
      const d = result.data;

      const explanation = await callAI(`
Explain only. Do not recalculate.

Data:
${JSON.stringify(d, null, 2)}
      `);

      return res.json({
        reply: `
📊 FINANCIAL ANALYSIS

Initial: ${d.initial}
Rate: ${d.rate}

RESULTS:
${d.results.map(r => `${r.type}: ${r.value}`).join('\n')}

━━━━━━━━━━
INSIGHT
━━━━━━━━━━
${explanation}
        `
      });
    }

    // ---------------- ERROR ----------------
    if (result.type === "error") {
      return res.json({ reply: result.data });
    }

    // ---------------- DEFAULT ----------------
    return res.json({ reply: result.data });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;