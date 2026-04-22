const axios = require("axios");

/**
 * VANGEEN - HuggingFace Provider
 * Uses the latest free Inference API (serverless)
 * with correct message format and fallback chain
 */

const MODELS = [
  "mistralai/Mistral-7B-Instruct-v0.3",
  "HuggingFaceH4/zephyr-7b-beta",
  "microsoft/Phi-3-mini-4k-instruct"
];

const SYSTEM_PROMPT = `You are Vangeen, a senior financial analyst, accountant, auditor, and economist.
RULES:
1. Never invent or change input data
2. Always use exact numbers provided
3. State assumptions clearly if data is missing
4. Show all reasoning step-by-step
5. Structure: Inputs → Methodology → Results → Interpretation
6. Say "Insufficient data" if unsure — never guess
Your goal is precision, analytical depth, and financial correctness.`;

async function queryModel(model, message, history = []) {
  // Build messages array in OpenAI-compatible format
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    })),
    { role: "user", content: message }
  ];

  const res = await axios.post(
    `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`,
    {
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.2,
      stream: false
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  const content = res.data?.choices?.[0]?.message?.content;

  if (!content || content.trim().length === 0) {
    throw new Error(`Empty response from ${model}`);
  }

  return content.trim();
}

async function callHF(message, history = []) {
  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`🔄 Trying HF model: ${model}`);
      const result = await queryModel(model, message, history);
      console.log(`✅ HF success via: ${model}`);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`❌ HF model failed (${model}): ${err.message}`);
    }
  }

  console.error("❌ All HF models failed:", lastError?.message);
  throw new Error("HuggingFace provider unavailable");
}

module.exports = { callHF };