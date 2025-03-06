const express = require('express');
const jwt = require('jsonwebtoken');
const WalletService = require('../services/walletService');

const router = express.Router();
const JWT_SECRET = 'your-secret-key'; // Mesma chave do auth-service

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

router.get('/balance', authenticate, async (req, res) => {
  try {
    const balance = await WalletService.getBalance(req.userEmail);
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await WalletService.getTransactions(req.userEmail);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send', authenticate, async (req, res) => {
  try {
    const transaction = await WalletService.send(req.userEmail, req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/exchange', authenticate, async (req, res) => {
  try {
    const { convertedAmount, transaction } = await WalletService.exchange(req.userEmail, req.body);
    res.json({ success: true, convertedAmount, transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/deposit', authenticate, async (req, res) => {
  try {
    const transaction = await WalletService.deposit(req.userEmail, req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;