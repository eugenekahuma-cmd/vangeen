const axios = require("axios");

async function callHF(message, history) {

  const prompt =
    history
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n") +
    `\nUSER: ${message}\nASSISTANT:`;

  const res = await axios.post(
    "https://api-inference.huggingface.co/models/google/gemma-4-E2B-it",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`
      }
    }
  );

  return res.data?.[0]?.generated_text || "HF no response";
}

module.exports = { callHF };