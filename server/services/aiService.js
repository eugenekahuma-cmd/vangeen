const axios = require('axios');

const systemPrompt = `
You are Vangeen, a precise financial analyst.

Rules:
- No guessing
- No hallucination
- Use structured reasoning
`;

async function callAI(message, history = []) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data?.choices?.[0]?.message?.content || "No response";

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    return "AI service temporarily unavailable.";
  }
}

module.exports = { callAI };