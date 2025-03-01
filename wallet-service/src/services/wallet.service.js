const Wallet = require("../models/wallet.model");

// Buscar a carteira de um usuário pelo userId
async function getWallet(userId) {
    return await Wallet.findOne({ userId });
}

// Criar uma nova carteira para o usuário
async function createWallet(userId) {
    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
        throw new Error("Carteira já existe para este usuário.");
    }

    const wallet = new Wallet({ userId, balance: 0, assets: [] });
    return await wallet.save(); // Salva novo documento na carteira
}

// Adicionar um ativo a carteira
async function addAsset(userId, asset) {
    const wallet = await getWallet(userId);
    if (!wallet) throw new Error("Carteira não encontrada.");

    // Verifica se o ativo ja existe na carteira
    const existingAsset = wallet.assets.find(a => a.symbol === asset.symbol);

    if (existingAsset) {
        existingAsset.quantity += asset.quantity;
    } else {
        wallet.assets.push(asset); // add ativo caso nao exista
    }

    return await wallet.save();
}

// Atualizar saldo da carteira
async function updateBalance(userId, amount) {
    const wallet = await getWallet(userId);
    if (!wallet) throw new Error("Carteira não encontrada.");

    wallet.balance += amount;
    return await wallet.save();
}

// Transferir fundos entre carteiras
async function transferFunds(fromUserId, toUserId, amount) {
    const senderWallet = await getWallet(fromUserId);
    const receiverWallet = await getWallet(toUserId);

    if (!senderWallet || !receiverWallet) throw new Error("Uma das carteiras não foi encontrada.");
    if (senderWallet.balance < amount) throw new Error("Saldo insuficiente.");

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    return { senderWallet, receiverWallet };
}

module.exports = {
    getWallet,
    createWallet,
    addAsset,
    updateBalance,
    transferFunds
};
