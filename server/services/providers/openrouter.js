const axios = require("axios");

async function callOpenRouter(message, history) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [
        ...history,
        { role: "user", content: message }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vangeen-app.com",
        "X-Title": "Vangeen AI"
      },
      timeout: 8000
    }
  );

  return res.data.choices[0].message.content;
}

module.exports = { callOpenRouter };