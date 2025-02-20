import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AuthFeedback from '../components/AuthFeedback';
import { login } from '../services/authService';
import { checkGeoLocation } from '../services/locationService';

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', token: '', pin: '' });
  const [step, setStep] = useState('token'); // token, biometric, geo, pin, success
  const [message, setMessage] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const submitToken = async () => {
    if (!form.email || !form.token) {
      setMessage({ text: 'Preencha e-mail e token', success: false });
      return;
    }
    const response = await login({ email: form.email, token: form.token });
    if (response.success) {
      if (!response.verified) setMessage({ text: 'Conta ainda não autenticada. Tente novamente mais tarde.', success: false });
      else setStep('biometric');
    } else setMessage({ text: response.error || 'Token inválido', success: false });
  };

  const submitBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setStep('geo');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Autentique-se com biometria' });
    if (result.success) setStep('geo');
    else setMessage({ text: 'Biometria falhou', success: false });
  };

  const submitGeo = async () => {
    try {
      const isWithinRange = await checkGeoLocation();
      if (isWithinRange) setStep('pin');
      else setMessage({ text: 'Fora do limite geográfico permitido', success: false });
    } catch (error) {
      setMessage({ text: 'Erro ao verificar localização', success: false });
    }
  };

  const submitPin = async () => {
    if (!form.pin || form.pin.length < 4) {
      setMessage({ text: 'PIN deve ter pelo menos 4 dígitos', success: false });
      return;
    }
    const response = await login({ email: form.email, pin: form.pin });
    if (response.success) {
      setStep('success');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => navigation.navigate('Home'));
    } else setMessage({ text: 'PIN inválido', success: false });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/wallet.png')} style={styles.logo} />
      <Text style={styles.title}>Neo Wallet</Text>

      {step === 'token' && (
        <>
          <InputField placeholder="E-mail" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />
          <InputField placeholder="Token OTP (6 dígitos)" value={form.token} onChangeText={(v) => handleChange('token', v)} keyboardType="numeric" />
          <CustomButton title="Entrar" onPress={submitToken} />
        </>
      )}

      {step === 'biometric' && (
        <>
          <Text style={styles.subtitle}>Autenticação Biométrica</Text>
          <CustomButton title="Verificar Biometria" onPress={submitBiometric} />
        </>
      )}

      {step === 'geo' && (
        <>
          <Text style={styles.subtitle}>Verificando Geolocalização...</Text>
          <CustomButton title="Confirmar Localização" onPress={submitGeo} />
        </>
      )}

      {step === 'pin' && (
        <>
          <Text style={styles.subtitle}>Digite seu PIN</Text>
          <InputField placeholder="PIN" value={form.pin} onChangeText={(v) => handleChange('pin', v)} secureTextEntry keyboardType="numeric" />
          <CustomButton title="Confirmar" onPress={submitPin} />
        </>
      )}

      {step === 'success' && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image source={require('../assets/success.gif')} style={styles.success} />
          <Text style={styles.successText}>Login bem-sucedido!</Text>
        </Animated.View>
      )}

      {message && <AuthFeedback message={message.text} success={message.success} />}
      {step === 'token' && (
        <>
          <CustomButton title="Cadastrar" onPress={() => navigation.navigate('Register')} style={styles.secondaryButton} />
          <CustomButton title="Recuperar Token" onPress={() => navigation.navigate('TokenReset')} style={styles.secondaryButton} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 15 },
  success: { width: 100, height: 100 },
  successText: { fontSize: 18, color: '#28a745', marginTop: 10 },
  secondaryButton: { backgroundColor: '#6c757d', marginTop: 5 },
});

export default LoginScreen;