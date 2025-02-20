import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:80'; // Via api-gateway

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