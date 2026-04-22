const axios = require("axios");

async function callHF(message, history) {
  const prompt =
    history.map(m => `${m.role}: ${m.content}`).join("\n") +
    `\nuser: ${message}\nassistant:`;

  const res = await axios.post(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.3
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`
      },
      timeout: 8000 // 🔥 timeout guard
    }
  );

  return res.data?.[0]?.generated_text || "No response";
}

module.exports = { callHF };