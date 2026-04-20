const { routeProviders } = require("./providerRouter");
const { safeFallback } = require("./fallback");

function normalizeHistory(history = []) {
  return history
    .filter(m => m?.role && m?.content)
    .map(m => ({
      role: m.role,
      content: m.content
    }));
}

/**
 * HARD TIMEOUT WRAPPER (CRITICAL FIX)
 */
function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), ms)
    )
  ]);
}

async function callAI(message, history = []) {
  const cleanHistory = normalizeHistory(history);

  try {
    const response = await withTimeout(
      routeProviders({ message, history: cleanHistory })
    );

    return response || safeFallback();

  } catch (err) {
    console.error("AI Gateway Error:", err.message);
    return safeFallback();
  }
}

module.exports = { callAI };