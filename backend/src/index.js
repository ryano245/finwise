const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Visit: http://localhost:${PORT}`);
});