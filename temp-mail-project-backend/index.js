const express = require('express');
const cors = require('cors');
const app = express();

const inboxStore = {}; // { email: [message1, message2, ...] }

app.use(cors());
app.use(express.json());

// Get inbox for an email
app.get('/inbox/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  res.json({ messages: inboxStore[email] || [] });
});

// Add message (ImprovMX will POST here later if needed)
app.post('/inbox/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const { subject, body, from } = req.body;

  if (!inboxStore[email]) inboxStore[email] = [];
  inboxStore[email].unshift({ from, subject, body, date: new Date() });

  // Keep only latest 5
  inboxStore[email] = inboxStore[email].slice(0, 5);

  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
