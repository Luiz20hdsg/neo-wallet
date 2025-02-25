const express = require('express');
const app = express();

app.use(express.json());

app.post('/login', (req, res) => {
  const { email, token } = req.body;
  if (email === 'teste@email.com' && token === '123456') {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));