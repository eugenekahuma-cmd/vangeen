const axios = require("axios");

const MODEL = "google/gemma-7b-it";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callHF(message, retries = 2) {
  const prompt = `
You are a precise financial and economic assistant.

User:
${message}
`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
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

      // ---------------- SAFE PARSING ----------------
      let output =
        data?.generated_text ||
        data?.[0]?.generated_text ||
        data?.error ||
        null;

      // ---------------- MODEL LOADING HANDLING ----------------
      if (typeof output === "object" && output?.error) {
        throw new Error(output.error);
      }

      if (!output || typeof output !== "string") {
        throw new Error("Invalid HF response format");
      }

      return output;

    } catch (err) {
      console.warn(`HF attempt ${attempt + 1} failed:`);

      // If model is loading → wait and retry
      if (err?.response?.data?.error?.includes("loading")) {
        await sleep(3000);
        continue;
      }

      if (attempt === retries) {
        throw err;
      }

      await sleep(1500);
    }
  }

  throw new Error("HF failed after retries");
}

module.exports = { callHF };