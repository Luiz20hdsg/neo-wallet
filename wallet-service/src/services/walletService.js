const { wallets } = require('../models/wallet');
const { convertAmount } = require('../utils/exchange');

class WalletService {
  static async getBalance(email) {
    return wallets[email]?.balance || { BRL: 0, USD: 0, BTC: 0 };
  }

  static async getTransactions(email) {
    return wallets[email]?.transactions || [];
  }

  static async send(email, { to, asset, amount }) {
    const senderWallet = wallets[email];
    if (!senderWallet || senderWallet.balance[asset] < amount) {
      throw new Error('Saldo insuficiente');
    }
    senderWallet.balance[asset] -= amount;
    const transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: `Enviado para ${to}`,
      asset,
      amount: -amount,
    };
    senderWallet.transactions.push(transaction);
    return transaction;
  }

  static async exchange(email, { fromAsset, toAsset, amount }) {
    const wallet = wallets[email];
    if (!wallet || wallet.balance[fromAsset] < amount) {
      throw new Error('Saldo insuficiente');
    }
    const convertedAmount = await convertAmount(fromAsset, toAsset, amount);
    wallet.balance[fromAsset] -= amount;
    wallet.balance[toAsset] = (wallet.balance[toAsset] || 0) + convertedAmount;
    const transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: `Troca ${fromAsset} → ${toAsset}`,
      asset: fromAsset,
      amount: -amount,
    };
    wallet.transactions.push(transaction);
    return { convertedAmount, transaction };
  }

  static async deposit(email, { asset, amount }) {
    const wallet = wallets[email];
    wallet.balance[asset] = (wallet.balance[asset] || 0) + amount;
    const transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: 'Recarga',
      asset,
      amount,
    };
    wallet.transactions.push(transaction);
    return transaction;
  }
}

module.exports = WalletService;