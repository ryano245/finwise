const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finwise Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Budget routes (placeholder for now)
app.get('/api/budgets', (req, res) => {
  res.json({ message: 'Budget routes coming soon!' });
});

// Expense routes (placeholder for now)
app.get('/api/expenses', (req, res) => {
  res.json({ message: 'Expense routes coming soon!' });
});

// Chatbot route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call SEA-LION API with v3.5 reasoning model
    const response = await axios.post(
      'https://api.sea-lion.ai/v1/chat/completions',
      {
        model: 'aisingapore/Llama-SEA-LION-v3.5-8B-R',
        messages: [
          { 
            role: 'system', 
            content: 'You are a friendly and knowledgeable financial assistant. Provide clear, practical, and responsible financial advice tailored to the user\'s needs. If unsure, encourage seeking a certified financial advisor.' 
          },
          { role: 'user', content: message }
        ],
        chat_template_kwargs: {
          thinking_mode: 'off'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SEA_LION_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return chatbot reply
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling SEA-LION API:', error.message);
    // res.status(500).json({ error: 'Failed to get chatbot response' });
    res.json({
      reply: "Sorry, we cannot provide advice at the moment. Please try again later."
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Visit: http://localhost:${PORT}`);
});