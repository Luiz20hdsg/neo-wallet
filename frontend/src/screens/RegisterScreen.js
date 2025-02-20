import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ToggleSwitch from '../components/ToggleSwitch';
import AuthFeedback from '../components/AuthFeedback';
import { register, verifyOtp } from '../services/authService';
import { validateCpf, validateEmail, validatePhone, validatePassword } from '../utils/validators';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: '', cpf: '', email: '', phone: '', otp: '', password: '', pin: '',
    faceAuth: true, biometric: false, geoAuth: false, termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('info'); // info, otp, security, terms
  const [message, setMessage] = useState(null);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: null });
  };

  const validateInfo = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Nome completo é obrigatório';
    if (!validateCpf(form.cpf)) newErrors.cpf = 'CPF inválido';
    if (!validateEmail(form.email)) newErrors.email = 'E-mail inválido';
    if (!validatePhone(form.phone)) newErrors.phone = 'Telefone inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitInfo = async () => {
    if (!validateInfo()) return;
    const { fullName, cpf, email, phone } = form;
    const response = await register({ fullName, cpf, email, phone });
    if (response.success) setStep('otp');
    else setMessage({ text: response.error || 'Erro ao cadastrar', success: false });
  };

  const submitOtp = async () => {
    if (!form.otp || form.otp.length < 6) {
      setErrors({ otp: 'Código OTP deve ter 6 dígitos' });
      return;
    }
    const response = await verifyOtp(form.email, form.otp);
    if (response.success) setStep('security');
    else setMessage({ text: 'OTP inválido', success: false });
  };

  const submitSecurity = () => {
    const { password, pin, faceAuth, biometric, geoAuth } = form;
    const factors = [
      password && 'password',
      pin && 'pin',
      faceAuth && 'face',
      biometric && 'biometric',
      geoAuth && 'geo',
    ].filter(Boolean);
    if (factors.length < 2) {
      setMessage({ text: 'Escolha pelo menos 2 fatores de autenticação', success: false });
      return;
    }
    if (password && !validatePassword(password)) {
      setErrors({ password: 'Senha deve ter 8+ caracteres, com letras maiúsculas, minúsculas e números' });
      return;
    }
    if (pin && pin.length < 4) {
      setErrors({ pin: 'PIN deve ter pelo menos 4 dígitos' });
      return;
    }
    setStep('terms');
  };

  const submitTerms = () => {
    if (!form.termsAccepted) {
      setMessage({ text: 'Você deve aceitar os termos e políticas', success: false });
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {step === 'info' ? 'Cadastro' : step === 'otp' ? 'Validação OTP' : step === 'security' ? 'Segurança' : 'Termos'}
      </Text>

      {step === 'info' && (
        <>
          <InputField placeholder="Nome completo" value={form.fullName} onChangeText={(v) => handleChange('fullName', v)} error={errors.fullName} />
          <InputField placeholder="CPF" value={form.cpf} onChangeText={(v) => handleChange('cpf', v)} error={errors.cpf} keyboardType="numeric" />
          <InputField placeholder="E-mail" value={form.email} onChangeText={(v) => handleChange('email', v)} error={errors.email} keyboardType="email-address" />
          <InputField placeholder="Telefone" value={form.phone} onChangeText={(v) => handleChange('phone', v)} error={errors.phone} keyboardType="phone-pad" />
          <CustomButton title="Próximo" onPress={submitInfo} />
        </>
      )}

      {step === 'otp' && (
        <>
          <Text style={styles.subtitle}>Enviamos um código para {form.email}</Text>
          <InputField placeholder="Código OTP (6 dígitos)" value={form.otp} onChangeText={(v) => handleChange('otp', v)} error={errors.otp} keyboardType="numeric" />
          <CustomButton title="Verificar" onPress={submitOtp} />
        </>
      )}

      {step === 'security' && (
        <>
          <InputField placeholder="Senha" value={form.password} onChangeText={(v) => handleChange('password', v)} secureTextEntry error={errors.password} />
          <InputField placeholder="PIN" value={form.pin} onChangeText={(v) => handleChange('pin', v)} secureTextEntry error={errors.pin} keyboardType="numeric" />
          <ToggleSwitch label="Reconhecimento Facial (recomendado)" value={form.faceAuth} onValueChange={(v) => handleChange('faceAuth', v)} />
          <ToggleSwitch label="Biometria (impressão digital)" value={form.biometric} onValueChange={(v) => handleChange('biometric', v)} />
          <ToggleSwitch label="Autenticação por Geolocalização" value={form.geoAuth} onValueChange={(v) => handleChange('geoAuth', v)} />
          <CustomButton title="Próximo" onPress={submitSecurity} />
        </>
      )}

      {step === 'terms' && (
        <>
          <Text style={styles.subtitle}>Aceite os Termos de Uso e Política de Privacidade</Text>
          <ToggleSwitch label="Aceito os termos" value={form.termsAccepted} onValueChange={(v) => handleChange('termsAccepted', v)} />
          <CustomButton title="Finalizar" onPress={submitTerms} />
        </>
      )}

      {message && <AuthFeedback message={message.text} success={message.success} />}
      <CustomButton title="Já tenho conta" onPress={() => navigation.navigate('Login')} style={styles.secondaryButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 15, textAlign: 'center' },
  secondaryButton: { backgroundColor: '#6c757d' },
});

export default RegisterScreen;