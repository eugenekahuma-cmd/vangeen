const { routeProviders } = require("./providerRouter");
const { safeFallback } = require("./fallback");

function normalizeHistory(history = []) {
  return history
    .filter(m => m.role && m.content)
    .map(m => ({
      role: m.role,
      content: m.content
    }));
}

async function callAI(message, history = []) {
  const cleanHistory = normalizeHistory(history);

  try {
    const response = await routeProviders({
      message,
      history: cleanHistory
    });

    if (response) return response;

    return safeFallback(message);

  } catch (err) {
    console.error("AI Gateway Fatal Error:", err);
    return safeFallback(message);
  }
}

module.exports = { callAI };