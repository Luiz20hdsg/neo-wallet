const wallets = {
  'teste@email.com': {
    balance: {
      BRL: 1234.56,
      USD: 200.00,
      BTC: 0.05,
    },
    transactions: [
      { id: '1', date: '2025-03-04', description: 'Supermercado', asset: 'BRL', amount: -150.00 },
      { id: '2', date: '2025-03-03', description: 'João', asset: 'BRL', amount: 200.00 },
    ],
  },
};

module.exports = { wallets };