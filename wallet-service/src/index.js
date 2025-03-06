const express = require("express");
const mongoose = require("mongoose");
const walletRoutes = require("./api/controllers/wallet.controller");

const app = express();
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect("mongodb://localhost:27017/walletDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Rotas da API
app.use("/wallet", walletRoutes);

const PORT = 3001; //porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
