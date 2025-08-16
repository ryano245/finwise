const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// JSON file path for storing confessions
const CONFESSIONS_FILE = path.join(__dirname, 'confessions.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
const loadConfessions = () => {
  if (!fs.existsSync(CONFESSIONS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CONFESSIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
};

const saveConfessions = (confessions) => {
  fs.writeFileSync(CONFESSIONS_FILE, JSON.stringify(confessions, null, 2));
};

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finwise Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Placeholder routes
app.get('/api/budgets', (req, res) => {
  res.json({ message: 'Budget routes coming soon!' });
});
app.get('/api/expenses', (req, res) => {
  res.json({ message: 'Expense routes coming soon!' });
});

// Chatbot route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await axios.post(
      'https://api.sea-lion.ai/v1/chat/completions',
      {
        model: 'aisingapore/Llama-SEA-LION-v3.5-8B-R',
        messages: [
          { 
            role: 'system', 
            content: 'You are a friendly, supportive and culturally aware financial advisor for youths in Indonesia. The user will confess financial mistakes or poor spending habits. Based on their confession, provide practical, responsible, and non-judgmental advice that takes into account the Indonesian context to help them improve their financial situation. If unsure, encourage seeking a certified financial advisor.' 
          },
          { role: 'user', content: message }
        ],
        chat_template_kwargs: { thinking_mode: 'off' }
      },
      { headers: { 
          'Authorization': `Bearer ${process.env.SEA_LION_API_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling SEA-LION API:', error.message);
    res.json({ reply: "Sorry, we cannot provide advice at the moment. Please try again later." });
  }
});

// Post a confession
app.post('/api/confess', (req, res) => {
  const { conversation, caption } = req.body;
  if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
    return res.status(400).json({ error: 'Conversation is required' });
  }

  const confessions = loadConfessions();
  const newConfession = {
    id: confessions.length + 1,
    caption: caption || '',
    conversation, // array of { sender, text }
    timestamp: new Date().toISOString()
  };

  confessions.push(newConfession);
  saveConfessions(confessions);

  res.json({ success: true, message: 'Conversation posted anonymously', confession: newConfession });
});

// Get all confessions (raw)
app.get('/api/confess', (req, res) => {
  const confessions = loadConfessions();
  res.json(confessions);
});

// Forum route (anonymous)
app.get('/api/forum', (req, res) => {
  const confessions = loadConfessions();
  const anonPosts = confessions.map((post) => ({
    id: post.id,
    caption: post.caption,
    conversation: post.conversation.map((msg) => ({ text: msg.text })),
    timestamp: post.timestamp
  }));

  res.json(anonPosts);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Visit: http://localhost:${PORT}`);
});


app.post('/api/generate-plan', async (req, res) => {
  try {
    const { budget, expenses, goals } = req.body;
    if (!budget || !expenses || !goals) {
      return res.status(400).json({ error: 'Budget, expenses, and goals are required' });
    }

    const response = await axios.post(
      'https://api.sea-lion.ai/v1/chat/completions',
      {
        model: 'aisingapore/Llama-SEA-LION-v3.5-8B-R',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor AI. Based on the user’s budget, expenses, and goals, provide a practical plan with step-by-step feedback on how to achieve the goals. Be detailed, actionable, and culturally aware for Indonesian users.'
          },
          { role: 'user', content: JSON.stringify({ budget, expenses, goals }) }
        ],
        chat_template_kwargs: { thinking_mode: 'off' },
        cache: { 'no-cache': true }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SEA_LION_API_KEY_BUDGET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ plan: response.data.choices[0].message.content });

  } catch (error) {
    console.error('Error calling SEA-LION Plan API:', error.message);
    res.status(500).json({ plan: "Sorry, we couldn't generate a plan at the moment. Please try again later." });
  }
});
