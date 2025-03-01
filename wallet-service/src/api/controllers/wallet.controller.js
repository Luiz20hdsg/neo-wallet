const express = require("express");
const router = express.Router();
const walletService = require("../services/wallet.service");

// Rota para criar nova carteira para usuario
router.post("/create", async(req, res) => {
    try {
        const { userId } = req.body;
        const wallet = await walletService.createWallet(userId);
        res.status(201).json(wallet);
    } catch(error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota busta carteira pelo userId
router.get("/:userId", async(req, res) => {
    try {
        const { userId } = req.params;
        const wallet = await walletService.getWallet(userId);
        if (!wallet) return res.status(404).json({ error: "Carteira não encontrada." });
        res.json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Adicionar ativo à carteira
router.post("/add-asset", async (req, res) => {
    try {
        const { userId, asset } = req.body;
        const wallet = await walletService.addAsset(userId, asset);
        res.json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar saldo
router.put("/update-balance", async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const wallet = await walletService.updateBalance(userId, amount);
        res.json(wallet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Transferir fundos entre carteiras
router.post("/transfer", async (req, res) => {
    try {
        const { fromUserId, toUserId, amount } = req.body;
        const transfer = await walletService.transferFunds(fromUserId, toUserId, amount);
        res.json(transfer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;