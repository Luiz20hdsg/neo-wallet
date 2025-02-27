import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AuthFeedback from '../components/AuthFeedback';
import { login } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', token: '' });
  const [message, setMessage] = useState(null);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const submitToken = async () => {
    console.log('LoginScreen: Enviando login:', form.email, form.token);
    try {
      const response = await login({ email: form.email, token: form.token });
      console.log('LoginScreen: Resposta do login:', response);
      if (response.success) {
        setMessage({ text: 'Login bem-sucedido!', success: true });
        setTimeout(() => navigation.navigate('Home'), 1500);
      } else {
        setMessage({ text: response.error || 'Credenciais inválidas', success: false });
      }
    } catch (error) {
      console.error('LoginScreen: Erro na requisição:', error);
      setMessage({ text: 'Erro de conexão com o servidor', success: false });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <InputField
        placeholder="E-mail"
        value={form.email}
        onChangeText={(v) => handleChange('email', v)}
        keyboardType="email-address"
      />
      <InputField
        placeholder="Token"
        value={form.token}
        onChangeText={(v) => handleChange('token', v)}
        keyboardType="numeric"
      />
      <CustomButton title="Entrar" onPress={submitToken} />
      {message && <AuthFeedback message={message.text} success={message.success} />}
      <CustomButton
        title="Cadastrar"
        onPress={() => navigation.navigate('Register')}
        style={styles.secondaryButton}
      />
      <CustomButton
        title="Recuperar Token"
        onPress={() => navigation.navigate('TokenReset')}
        style={styles.secondaryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  secondaryButton: { backgroundColor: '#6c757d', marginTop: 10 },
});

export default LoginScreen;