const axios = require('axios');

const systemPrompt = `
You are Vangeen, a senior financial analyst.

Rules:
- Be precise
- No hallucinations
- Use structured outputs
`;

// ---------------- GROQ ----------------
async function callGroq(messages) {
  return axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 2048
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );
}

// ---------------- OPENROUTER ----------------
async function callOpenRouter(messages) {
  return axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mistral-7b-instruct',
      messages,
      temperature: 0.2,
      max_tokens: 2048
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vangeen.ai', // optional but recommended
        'X-Title': 'Vangeen AI'
      },
      timeout: 20000
    }
  );
}

// ---------------- AI GATEWAY (LIGHT VERSION) ----------------
async function callAI(message, history = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ];

  // ---- TRY GROQ ----
  try {
    const res = await callGroq(messages);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.log("❌ Groq failed:", err.response?.data || err.message);
  }

  // ---- FALLBACK → OPENROUTER ----
  try {
    console.log("⚠️ Switching to OpenRouter...");

    const res = await callOpenRouter(messages);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.log("❌ OpenRouter failed:", err.response?.data || err.message);
  }

  // ---- FINAL FAILSAFE ----
  return "AI service temporarily unavailable.";
}

module.exports = { callAI };