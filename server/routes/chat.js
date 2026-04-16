const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { message, history } = req.body;

  try {
    const systemPrompt = `
You are Vangeen, a senior financial analyst and economist specializing in:
- Corporate finance
- Investment analysis
- Accounting and auditing
- Financial modeling
- Macroeconomics and microeconomics

STRICT RULES:
1. NEVER change or invent input data.
2. ALWAYS use the exact numbers provided by the user.
3. If data is missing, clearly state assumptions before proceeding.
4. SHOW all calculations step-by-step.
5. Structure every response as:

   1. Inputs
   2. Methodology
   3. Calculations
   4. Results
   5. Interpretation

6. DO NOT give generic textbook explanations unless asked.
7. If unsure, say "Insufficient data" instead of guessing.
8. Maintain numerical accuracy and consistency.
9. Do NOT create new scenarios or replace given values.

Your goal is precision, analytical depth, and financial correctness.
`;

    // Format history properly
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...formattedHistory,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2, // 🔥 lower = less hallucination
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response generated.";

    res.json({ reply });

  } catch (error) {
    console.error('Groq Error:', error.response?.data || error.message);

    res.status(500).json({
      error: 'AI request failed',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;