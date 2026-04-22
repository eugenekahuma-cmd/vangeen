const axios = require("axios");

async function callHF(message) {
  const prompt = `
Answer clearly and concisely:

${message}
`;

  const res = await axios.post(
    "https://api-inference.huggingface.co/models/google/flan-t5-large",
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`
      },
      timeout: 8000
    }
  );

  return res.data?.[0]?.generated_text || "No response";
}

module.exports = { callHF };