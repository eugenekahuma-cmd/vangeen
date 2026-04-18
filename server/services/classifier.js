const { callAI } = require('./aiService');

async function classifyIntent(message) {
  const response = await callAI(`
Classify into ONE:

finance, accounting, audit, macroeconomics, microeconomics, econometrics, general

Return ONLY JSON:
{ "intent": "finance" }

Query:
${message}
  `);

  try {
    return JSON.parse(response);
  } catch {
    return { intent: "general" };
  }
}

module.exports = { classifyIntent };