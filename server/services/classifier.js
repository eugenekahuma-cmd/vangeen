const { callAI } = require('./aiService');

function ruleBasedIntent(message) {
  const m = message.toLowerCase();

  // HARD RULE: explanation queries NEVER go to finance
  if (m.startsWith("what is") || m.startsWith("define") || m.startsWith("explain")) {
    return "general";
  }

  // HARD RULE: only compute triggers finance
  if (
    m.includes("calculate") ||
    m.includes("compute") ||
    (m.match(/\d/) && (m.includes("npv") || m.includes("irr")))
  ) {
    return "finance";
  }

  return null; // let LLM decide
}

async function classifyIntent(message) {
  try {
    // 1. RULE-BASED LAYER (FAST + SAFE)
    const rule = ruleBasedIntent(message);
    if (rule) return { intent: rule };

    // 2. LLM FALLBACK
    const response = await callAI(`
Classify intent strictly into one:
finance, accounting, audit, macroeconomics, microeconomics, econometrics, general

Return ONLY JSON:
{ "intent": "finance" }

Rules:
- "what is", "define", "explain" → general
- calculation requests → finance

Query:
${message}
    `);

    const parsed = JSON.parse(response);
    return parsed;

  } catch (err) {
    console.error("Classifier Error:", err);
    return { intent: "general" };
  }
}

module.exports = { classifyIntent };