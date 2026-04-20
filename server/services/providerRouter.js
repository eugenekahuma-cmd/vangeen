const { callGroq } = require("./providers/groq");
const { callHF } = require("./providers/huggingface");
const { callOpenRouter } = require("./providers/openrouter");

async function safeCall(fn, label) {
  const start = Date.now();

  try {
    const result = await fn();
    const latency = Date.now() - start;

    return {
      success: true,
      data: result,
      latency,
      provider: label
    };

  } catch (err) {
    console.warn(`${label} failed`);
    return { success: false };
  }
}

async function routeProviders({ message, history }) {

  // TRY ALL IN PARALLEL (THIS IS UPGRADE)
  const results = await Promise.allSettled([
    safeCall(() => callGroq(message, history), "groq"),
    safeCall(() => callHF(message, history), "hf"),
    safeCall(() => callOpenRouter(message, history), "openrouter")
  ]);

  // PICK FIRST SUCCESSFUL (FASTEST EFFECTIVE RESPONSE)
  const success = results
    .map(r => r.value)
    .filter(r => r && r.success)
    .sort((a, b) => a.latency - b.latency)[0];

  if (success) return success.data;

  return null;
}

module.exports = { routeProviders };