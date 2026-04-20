const axios = require("axios");

/**
 * -------------------------------
 * PROVIDER 1: GROQ
 * -------------------------------
 */
async function callGroq(messages) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.2,
        max_tokens: 1024
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ Groq failed:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * -------------------------------
 * PROVIDER 2: HUGGINGFACE (GEMMA)
 * -------------------------------
 */
async function callHuggingFace(messages) {
  try {
    const prompt = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/gemma-4-E2B-it",
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.3
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`
        }
      }
    );

    return response.data?.[0]?.generated_text || "No response";

  } catch (err) {
    console.error("❌ HuggingFace failed:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * -------------------------------
 * AI GATEWAY (MAIN ENTRY POINT)
 * -------------------------------
 */
async function callAI(message, history = []) {

  const messages = [
    {
      role: "system",
      content: "You are Vangeen, a precise financial AI assistant."
    },
    ...history
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({
        role: m.role,
        content: m.content
      })),
    { role: "user", content: message }
  ];

  // ---------------- TRY GROQ FIRST ----------------
  try {
    return await callGroq(messages);
  } catch (err1) {

    // ---------------- FALLBACK: HUGGINGFACE ----------------
    try {
      return await callHuggingFace(messages);
    } catch (err2) {

      // ---------------- FINAL SAFE FALLBACK ----------------
      console.error("❌ All models failed");

      return "AI service temporarily unavailable. Please try again later.";
    }
  }
}

module.exports = { callAI };