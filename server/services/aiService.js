const axios = require("axios");

// ---------------- CLEAN MESSAGES ----------------
function sanitizeMessages(messages = []) {
  return messages.map(m => ({
    role: m.role,
    content: m.content
  }));
}

// ---------------- SYSTEM PROMPT ----------------
const systemPrompt = `
You are Vangeen AI, a financial reasoning assistant.

Rules:
- Be precise
- Never hallucinate numbers
- Ask for missing data instead of guessing
`;

// ======================================================
// 1. GROQ (PRIMARY)
// ======================================================
async function groqCall(message, history = []) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizeMessages(history),
          { role: "user", content: message }
        ],
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

  } catch (err) {
    console.error("❌ Groq failed:", err.response?.data || err.message);
    return null;
  }
}

// ======================================================
// 2. HUGGINGFACE GEMMA (FALLBACK)
// ======================================================
async function gemmaCall(message, history = []) {
  try {
    const prompt = `
${systemPrompt}

Conversation:
${sanitizeMessages(history).map(m => `${m.role}: ${m.content}`).join("\n")}

user: ${message}
assistant:
`;

    const res = await axios.post(
      "https://api-inference.huggingface.co/models/google/gemma-4-e2b-it",
      {
        inputs: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data?.[0]?.generated_text || res.data?.generated_text || null;

  } catch (err) {
    console.error("❌ HF Gemma failed:", err.response?.data || err.message);
    return null;
  }
}

// ======================================================
// 3. RULE-BASED FALLBACK (NO AI DEPENDENCY)
// ======================================================
function fallbackResponse(message) {
  return "AI temporarily unavailable. Please retry or refine your query.";
}

// ======================================================
// 4. AI GATEWAY (CLEAN FAILOVER CHAIN)
// ======================================================
async function callAI(message, history = []) {

  // 1. Groq
  let response = await groqCall(message, history);
  if (response) return response;

  console.log("⚠️ Switching to HuggingFace...");

  // 2. HuggingFace Gemma
  response = await gemmaCall(message, history);
  if (response) return response;

  // 3. Hard fallback
  return fallbackResponse(message);
}

module.exports = { callAI };