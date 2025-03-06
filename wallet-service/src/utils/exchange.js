const axios = require('axios');

const API_KEY = 'c0c26e96ef4e75a40e49927d7aabf4ac59a59fe8c66becd71cf0d5b6a0539ce6'; // Substitua pela chave da CryptoCompare (grátis)
const BASE_URL = 'https://min-api.cryptocompare.com/data';

// Obter preço de um ativo em relação a outro
async function getExchangeRate(from, to) {
  try {
    const response = await axios.get(`${BASE_URL}/price?fsym=${from}&tsyms=${to}&api_key=${API_KEY}`);
    return response.data[to];
  } catch (error) {
    console.error('Erro ao obter taxa de câmbio:', error);
    return null;
  }
}

// Simulação de taxas fixas (caso API falhe)
const fallbackRates = {
  'BRL-USD': 0.20, // 1 BRL = 0.20 USD
  'USD-BRL': 5.00, // 1 USD = 5 BRL
  'BTC-USD': 30000, // 1 BTC = 30,000 USD
  'USD-BTC': 0.000033,
};

async function convertAmount(fromAsset, toAsset, amount) {
  const rate = await getExchangeRate(fromAsset, toAsset) || fallbackRates[`${fromAsset}-${toAsset}`];
  if (!rate) throw new Error('Taxa de câmbio indisponível');
  return amount * rate;
}

module.exports = { convertAmount };