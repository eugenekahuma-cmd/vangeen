const axios = require("axios");

async function callGroq(message, history) {

  const messages = [
    ...history.map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: message }
  ];

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.2
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message.content;
}

module.exports = { callGroq };