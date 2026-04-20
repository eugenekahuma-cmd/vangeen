const axios = require('axios');

const systemPrompt = `
You are Vangeen, a senior financial analyst.

Rules:
- Be precise
- No guessing
- Structure answers clearly
`;

// ---------------- SANITIZE ----------------
function cleanHistory(history = []) {
  return history.map(m => ({
    role: m.role,
    content: m.content
  }));
}

// ---------------- PROVIDERS ----------------

async function callGroq(messages) {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ Groq failed:", err.response?.data || err.message);
    throw new Error("Groq failed");
  }
}

async function callOpenRouter(messages) {
  try {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // safe default
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ OpenRouter failed:", err.response?.data || err.message);
    throw new Error("OpenRouter failed");
  }
}

// 🆓 LAST RESORT (free / unstable)
async function callFree(messages) {
  try {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ Free model failed:", err.response?.data || err.message);
    throw new Error("Free fallback failed");
  }
}

// ---------------- GATEWAY ----------------

async function callAI(message, history = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...cleanHistory(history),
    { role: 'user', content: message }
  ];

  // 🔁 Retry logic (simple)
  const providers = [
    { name: "Groq", fn: callGroq },
    { name: "OpenRouter", fn: callOpenRouter },
    { name: "FreeFallback", fn: callFree }
  ];

  for (const provider of providers) {
    try {
      console.log(`➡️ Trying ${provider.name}...`);
      const result = await provider.fn(messages);
      console.log(`✅ ${provider.name} success`);
      return result;

    } catch (err) {
      console.log(`⚠️ ${provider.name} failed, trying next...`);
    }
  }

  return "AI service temporarily unavailable.";
}

module.exports = { callAI };