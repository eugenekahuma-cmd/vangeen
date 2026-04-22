const axios = require("axios");

/**
 * SAFE HF PROVIDER
 * - retries
 * - fallback model
 * - correct inference API format
 */

const MODELS = [
  "google/gemma-7b-it",
  "mistralai/Mistral-7B-Instruct-v0.2",
  "HuggingFaceH4/zephyr-7b-beta"
];

function buildPrompt(message, history) {
  const formatted = history
    .filter(m => m.role && m.content)
    .map(m => `${m.role}: ${m.content}`)
    .join("\n");

  return `${formatted}\nuser: ${message}\nassistant:`;
}

async function queryModel(model, prompt) {
  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.3,
        return_full_text: false
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );

  const data = res.data;

  if (Array.isArray(data)) {
    return data[0]?.generated_text || null;
  }

  return data?.generated_text || null;
}

async function callHF(message, history = []) {
  const prompt = buildPrompt(message, history);

  let lastError;

  for (const model of MODELS) {
    try {
      const result = await queryModel(model, prompt);

      if (result && result.trim().length > 0) {
        console.log(`✅ HF success via ${model}`);
        return result;
      }
    } catch (err) {
      lastError = err;
      console.warn(`❌ HF model failed: ${model}`);
    }
  }

  console.error("❌ HF all models failed:", lastError?.message);
  throw new Error("HuggingFace provider failed");
}

module.exports = { callHF };