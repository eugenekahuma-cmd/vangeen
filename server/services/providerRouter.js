const { callGroq } = require("./providers/groq");
const { callHF } = require("./providers/huggingface");
const { callOpenRouter } = require("./providers/openrouter");

// 🔥 simple in-memory circuit breaker
const providerState = {
  groq: { disabled: false },
  hf: { disabled: false },
  openrouter: { disabled: false }
};

function classifyError(err) {
  const status = err.response?.status;

  if (status === 401 || status === 403) return "AUTH";
  if (status === 404) return "CONFIG";
  if (status >= 500) return "SERVER";
  return "NETWORK";
}

async function tryProvider(name, fn) {
  if (providerState[name].disabled) {
    console.warn(`⛔ ${name} skipped (disabled)`);
    return null;
  }

  try {
    const res = await fn();
    console.log(`✅ ${name} success`);
    return res;
  } catch (err) {
    const type = classifyError(err);

    console.warn(`❌ ${name} failed → ${type}`);

    // 🔥 disable permanently for bad config/auth
    if (type === "AUTH" || type === "CONFIG") {
      providerState[name].disabled = true;
    }

    return null;
  }
}

async function routeProviders({ message, history }) {
  // 1. GROQ
  let res = await tryProvider("groq", () =>
    callGroq(message, history)
  );
  if (res) return res;

  // 2. HF
  res = await tryProvider("hf", () =>
    callHF(message, history)
  );
  if (res) return res;

  // 3. OPENROUTER
  res = await tryProvider("openrouter", () =>
    callOpenRouter(message, history)
  );
  if (res) return res;

  console.error("🚨 All providers failed");
  return null;
}

module.exports = { routeProviders };