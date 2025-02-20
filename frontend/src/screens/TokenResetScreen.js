import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AuthFeedback from '../components/AuthFeedback';
import { resetToken } from '../services/authService';

const TokenResetScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', pin: '', biometric: false, newToken: '' });
  const [message, setMessage] = useState(null);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const submitReset = async () => {
    if (!form.email || !form.pin || !form.newToken) {
      setMessage({ text: 'Preencha todos os campos', success: false });
      return;
    }
    const biometricResult = form.biometric ? await LocalAuthentication.authenticateAsync() : { success: true };
    if (!biometricResult.success) {
      setMessage({ text: 'Biometria falhou', success: false });
      return;
    }
    const response = await resetToken(form.email, { pin: form.pin, newToken: form.newToken });
    if (response.success) {
      setMessage({ text: 'Token resetado com sucesso!', success: true });
      setTimeout(() => navigation.navigate('Login'), 1500);
    } else setMessage({ text: response.error || 'Erro ao resetar token', success: false });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Token</Text>
      <InputField placeholder="E-mail" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />
      <InputField placeholder="PIN atual" value={form.pin} onChangeText={(v) => handleChange('pin', v)} secureTextEntry keyboardType="numeric" />
      <ToggleSwitch label="Usar Biometria" value={form.biometric} onValueChange={(v) => handleChange('biometric', v)} />
      <InputField placeholder="Novo Token (6 dígitos)" value={form.newToken} onChangeText={(v) => handleChange('newToken', v)} keyboardType="numeric" />
      <CustomButton title="Resetar Token" onPress={submitReset} />
      {message && <AuthFeedback message={message.text} success={message.success} />}
      <CustomButton title="Voltar" onPress={() => navigation.navigate('Login')} style={styles.secondaryButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  secondaryButton: { backgroundColor: '#6c757d', marginTop: 10 },
});

export default TokenResetScreen;