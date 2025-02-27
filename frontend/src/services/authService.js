import AsyncStorage from '@react-native-async-storage/async-storage';

// Use o IP da sua máquina na mesma rede Wi-Fi que o celular
const API_URL = 'http://192.168.3.65:3000'; // Substitua pelo IP do seu computador

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (data.token) await AsyncStorage.setItem('token', data.token);
  return data;
};

export const resetToken = async (email, newFactors) => {
  const response = await fetch(`${API_URL}/reset-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...newFactors }),
  });
  return response.json();
};