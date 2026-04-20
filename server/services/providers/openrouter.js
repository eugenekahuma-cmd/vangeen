const axios = require("axios");

async function callOpenRouter(message, history) {

  const messages = [
    ...history.map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: message }
  ];

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message.content;
}

module.exports = { callOpenRouter };