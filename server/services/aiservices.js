const axios = require('axios');

const systemPrompt = `
You are Vangeen, a senior financial analyst, accountant, auditor, and economist.

STRICT RULES:
1. NEVER invent or change input data
2. ALWAYS use exact numbers provided
3. If data is missing, state assumptions clearly
4. SHOW all reasoning step-by-step
5. Structure responses as: Inputs → Methodology → Results → Interpretation
6. DO NOT give generic textbook answers unless asked
7. If unsure, say "Insufficient data" — never guess
8. Maintain numerical accuracy and consistency
9. Cover: Finance, Accounting, Auditing, Macroeconomics, Microeconomics, Econometrics

Your goal is precision, analytical depth, and financial correctness.
`;

async function callAI(message, history = []) {
  try {
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
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    return "AI service temporarily unavailable.";
  }
}

module.exports = { callAI };