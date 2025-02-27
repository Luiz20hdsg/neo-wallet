const express = require('express');
const app = express();

app.use(express.json());

// Simulação de "banco de dados" em memória
const users = []; // { email, fullName, cpf, phone, token, pin, password }

app.post('/login', (req, res) => {
  const { email, token } = req.body;
  console.log('Backend: Login solicitado:', email, token);
  const user = users.find(u => u.email === email && u.token === token);
  if (user) {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, error: 'Credenciais inválidas' });
  }
});

app.post('/register', (req, res) => {
  const { fullName, cpf, email, phone } = req.body;
  console.log('Backend: Registro solicitado:', { fullName, cpf, email, phone });
  if (!fullName || !cpf || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Todos os campos são obrigatórios' });
  }
  const user = { fullName, cpf, email, phone, token: '123456' }; // OTP fixo por agora
  users.push(user);
  res.json({ success: true, message: 'Código de verificação enviado' });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp, method } = req.body;
  console.log('Backend: Verificando código:', email, otp, method);
  const user = users.find(u => u.email === email);
  if (user && user.token === otp) {
    res.json({ success: true, message: 'Código verificado' });
  } else {
    res.status(400).json({ success: false, error: 'Código inválido' });
  }
});

app.post('/reset-token', (req, res) => {
  const { email, pin, newToken } = req.body;
  console.log('Backend: Reset de token solicitado:', { email, pin, newToken });
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
  }
  if (user.pin && user.pin !== pin) {
    return res.status(401).json({ success: false, error: 'PIN inválido' });
  }
  user.token = newToken;
  res.json({ success: true, message: 'Token resetado com sucesso' });
});

app.listen(3000, () => console.log('Server running on port 3000'));