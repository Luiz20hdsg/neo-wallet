import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_API_URL = 'http://192.168.3.65:3001/wallet'; // IP da máquina na rede Wi-Fi

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const fetchBalance = async () => {
  const response = await fetch(`${WALLET_API_URL}/balance`, { headers: await getAuthHeaders() });
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${WALLET_API_URL}/transactions`, { headers: await getAuthHeaders() });
  return response.json();
};

export const sendMoney = async (data) => {
  const response = await fetch(`${WALLET_API_URL}/send`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const exchangeAssets = async (data) => {
  const response = await fetch(`${WALLET_API_URL}/exchange`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const depositMoney = async (data) => {
  const response = await fetch(`${WALLET_API_URL}/deposit`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};