const { callAI } = require('./aiService');

async function classifyIntent(message) {
  try {
    const response = await callAI(`
Classify into ONE:
finance, accounting, audit, macroeconomics, microeconomics, econometrics, general

Return ONLY JSON:
{ "intent": "finance" }

Query:
${message}
    `);

    return JSON.parse(response);

  } catch {
    return { intent: "general" };
  }
}

module.exports = { classifyIntent };