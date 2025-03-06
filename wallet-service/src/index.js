const express = require('express');
const walletRoutes = require('./api/wallet');

const app = express();

app.use(express.json());
app.use('/wallet', walletRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Wallet service running on port ${PORT}`));