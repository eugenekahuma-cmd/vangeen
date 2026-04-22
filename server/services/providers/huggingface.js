const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;

const MODELS = [
  "mistralai/Mistral-7B-Instruct-v0.3",
  "HuggingFaceH4/zephyr-7b-beta",
  "microsoft/Phi-3-mini-4k-instruct"
];

// ---------------- MAIN ----------------
async function callHF(message, history = []) {

  if (!HF_API_KEY) {
    console.warn("❌ HF missing API key");
    return null;
  }

  const prompt = buildPrompt(message, history);

  for (const model of MODELS) {
    try {
      console.log(`🔄 Trying HF model: ${model}`);

      const payload = buildPayload(model, prompt);

      const res = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const output = extract(res.data);

      if (output) {
        console.log(`✅ HF success: ${model}`);
        return output;
      }

    } catch (err) {
      console.warn(
        `❌ HF model failed (${model}):`,
        err.response?.status,
        err.response?.data || err.message
      );
    }
  }

  console.error("❌ All HF models failed");
  return null;
}

// ---------------- ADAPTIVE PAYLOAD BUILDER ----------------
function buildPayload(model, prompt) {

  // Phi models are strict text-only
  if (model.includes("Phi")) {
    return { inputs: prompt };
  }

  // Mistral + Zephyr support generation config BUT picky
  return {
    inputs: prompt,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.3,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false
    }
  };
}

// ---------------- PROMPT BUILDER ----------------
function buildPrompt(message, history) {
  const safeHistory = history.slice(-6);

  const context = safeHistory
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  return `
You are a financial AI assistant.

Conversation:
${context}

USER: ${message}
ASSISTANT:
`.trim();
}

// ---------------- RESPONSE PARSER ----------------
function extract(data) {

  if (!data) return null;

  // array format
  if (Array.isArray(data)) {
    return data[0]?.generated_text || null;
  }

  // direct string response (some HF models)
  if (typeof data === "string") {
    return data;
  }

  // object format
  if (typeof data === "object") {
    return data.generated_text
      || data?.[0]?.generated_text
      || null;
  }

  return null;
}

module.exports = { callHF };