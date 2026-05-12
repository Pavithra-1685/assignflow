const express = require('express');
const { OpenAI } = require('openai');
const auth = require('../middleware/auth');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    // context can include recent assignments or MCQ data for better assistance
    const systemPrompt = `You are an expert AI Study Assistant for AssignFlow.
    Help students with their academic queries, explain concepts, and guide them through assignments.
    Current Context: ${JSON.stringify(context)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      max_tokens: 1000,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
