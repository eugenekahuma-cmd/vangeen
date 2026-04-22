const { callGroq } = require("./providers/groq");
const { callHF } = require("./providers/huggingface");
const { callOpenRouter } = require("./providers/openrouter");

const {
  recordSuccess,
  recordFailure,
  isAvailable,
  getScore
} = require("./providerState");

const { retry, withTimeout } = require("./utils");

const PROVIDERS = [
  { name: "groq", fn: callGroq },
  { name: "hf", fn: callHF },
  { name: "openrouter", fn: callOpenRouter }
];

async function routeProviders({ message, history }) {

  // 🔥 SORT BY SCORE (BEST FIRST)
  const ranked = PROVIDERS
    .filter(p => isAvailable(p.name))
    .sort((a, b) => getScore(a.name) - getScore(b.name));

  for (const provider of ranked) {
    const start = Date.now();

    try {
      const result = await retry(() =>
        withTimeout(provider.fn(message, history), 8000)
      );

      const latency = Date.now() - start;

      recordSuccess(provider.name, latency);

      console.log(`✅ ${provider.name} success (${latency}ms)`);

      return result;

    } catch (err) {
      recordFailure(provider.name);
      console.warn(`❌ ${provider.name} failed → ${err.message}`);
    }
  }

  console.error("🚨 All providers failed");
  return null;
}

module.exports = { routeProviders };