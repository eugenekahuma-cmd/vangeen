const { callGroq } = require("./providers/groq");
const { callHF } = require("./providers/huggingface");
const { callOpenRouter } = require("./providers/openrouter");

// 🔥 CONTROL SWITCHES
const DISABLE_GROQ = true;
const DISABLE_HF = false;
const DISABLE_OPENROUTER = true;

// 🔥 circuit state
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

    if (type === "AUTH" || type === "CONFIG") {
      providerState[name].disabled = true;
    }

    return null;
  }
}

async function routeProviders({ message, history }) {

  // 🔴 GROQ (DISABLED)
  if (!DISABLE_GROQ) {
    let res = await tryProvider("groq", () =>
      callGroq(message, history)
    );
    if (res) return res;
  }

  // 🟢 HUGGINGFACE (ACTIVE)
  if (!DISABLE_HF) {
    let res = await tryProvider("hf", () =>
      callHF(message, history)
    );
    if (res) return res;
  }

  // 🔴 OPENROUTER (DISABLED)
  if (!DISABLE_OPENROUTER) {
    let res = await tryProvider("openrouter", () =>
      callOpenRouter(message, history)
    );
    if (res) return res;
  }

  console.error("🚨 All providers failed");
  return null;
}

module.exports = { routeProviders };