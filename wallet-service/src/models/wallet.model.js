const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
    name: { type: String, requred: false },  // Nome do ativo
    symbol: { type: String, required: true }, // Simbolo do ativo
    quantity: { type: Number, required: true }, // Quantidade do ativo
    price: { type: Number, required: true } // Preco do ativo
});

const WalletSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Id do usuario
    assets: { type: [AssetSchema], default: [] }, // Lista de ativos
    balance: { type: Number, default: 0 } // Principal saldo da carteira
}, { timestamp: true });

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;