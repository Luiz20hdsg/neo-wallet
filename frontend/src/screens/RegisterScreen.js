import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import ToggleSwitch from '../components/ToggleSwitch';
import AuthFeedback from '../components/AuthFeedback';
import { register, verifyOtp } from '../services/authService';
import { validateCpf, validateEmail, validatePhone, validatePassword } from '../utils/validators';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: '', cpf: '', email: '', phone: '', code: '', codeMethod: 'email',
    docPhoto: null, selfiePhoto: null, password: '', pin: '', faceAuth: true,
    biometric: false, geoAuth: false, termsAccepted: false, dataConsent: false,
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('info'); // info, code, docs, security, terms, validation
  const [message, setMessage] = useState(null);

  const handleChange = (key, value) => {
    console.log(`RegisterScreen: Alterando ${key} para ${value}`);
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
    console.log('RegisterScreen: Enviando informações básicas');
    if (!validateInfo()) return;
    try {
      const response = await register({
        fullName: form.fullName,
        cpf: form.cpf,
        email: form.email,
        phone: form.phone,
      });
      console.log('RegisterScreen: Resposta do register:', response);
      if (response.success) {
        setStep('code');
      } else {
        setMessage({ text: response.error || 'Erro ao cadastrar', success: false });
      }
    } catch (error) {
      console.error('RegisterScreen: Erro na requisição:', error);
      setMessage({ text: 'Erro de conexão com o servidor', success: false });
    }
  };

  const submitCode = async () => {
    console.log('RegisterScreen: Verificando código:', form.code, form.codeMethod);
    if (!form.code || form.code.length < 6) {
      setErrors({ code: 'Código deve ter 6 dígitos' });
      return;
    }
    try {
      const response = await verifyOtp(form.email, form.code, form.codeMethod);
      console.log('RegisterScreen: Resposta do verifyOtp:', response);
      if (response.success) {
        setStep('docs');
      } else {
        setMessage({ text: 'Código inválido', success: false });
      }
    } catch (error) {
      console.error('RegisterScreen: Erro na requisição:', error);
      setMessage({ text: 'Erro de conexão com o servidor', success: false });
    }
  };

  const submitDocs = () => {
    console.log('RegisterScreen: Enviando documentos:', form.docPhoto, form.selfiePhoto);
    if (!form.docPhoto || !form.selfiePhoto) {
      setMessage({ text: 'Envie ambos os documentos', success: false });
      return;
    }
    setStep('security');
  };

  const submitSecurity = () => {
    console.log('RegisterScreen: Configurando segurança:', form);
    const { pin, password, faceAuth, biometric, geoAuth } = form;
    const factors = [pin && 'pin', password && 'password', faceAuth && 'face', biometric && 'biometric', geoAuth && 'geo'].filter(Boolean);
    if (!pin) {
      setMessage({ text: 'PIN é obrigatório', success: false });
      return;
    }
    if (factors.length < 2) {
      setMessage({ text: 'Escolha pelo menos 2 fatores (PIN é obrigatório)', success: false });
      return;
    }
    if (password && !validatePassword(password)) {
      setErrors({ password: 'Senha deve ter 8+ caracteres, com letras maiúsculas, minúsculas e números' });
      return;
    }
    if (pin.length < 4) {
      setErrors({ pin: 'PIN deve ter pelo menos 4 dígitos' });
      return;
    }
    setStep('terms');
  };

  const submitTerms = () => {
    console.log('RegisterScreen: Verificando termos:', form.termsAccepted, form.dataConsent);
    if (!form.termsAccepted || !form.dataConsent) {
      setMessage({ text: 'Aceite os termos e a consulta de dados', success: false });
      return;
    }
    setStep('validation');
    setTimeout(() => {
      console.log('RegisterScreen: Validando conta');
      setMessage({ text: 'Conta validada com sucesso!', success: true });
      setTimeout(() => navigation.navigate('Login'), 1500);
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {step === 'info' ? 'Cadastro' : 
         step === 'code' ? 'Código de Verificação' : 
         step === 'docs' ? 'Documentos' : 
         step === 'security' ? 'Segurança' : 
         step === 'terms' ? 'Termos' : 'Validação'}
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

      {step === 'code' && (
        <>
          <Text style={styles.subtitle}>Receba seu Código de Verificação por:</Text>
          <View style={styles.choiceContainer}>
            <TouchableOpacity onPress={() => handleChange('codeMethod', 'email')} style={[styles.choice, form.codeMethod === 'email' && styles.choiceSelected]}>
              <Text>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChange('codeMethod', 'sms')} style={[styles.choice, form.codeMethod === 'sms' && styles.choiceSelected]}>
              <Text>SMS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Enviamos um código para {form.codeMethod === 'email' ? form.email : form.phone}</Text>
          <InputField placeholder="Código de Verificação (6 dígitos)" value={form.code} onChangeText={(v) => handleChange('code', v)} error={errors.code} keyboardType="numeric" />
          <CustomButton title="Verificar" onPress={submitCode} />
        </>
      )}

      {step === 'docs' && (
        <>
          <Text style={styles.subtitle}>Envie seus documentos</Text>
          <CustomButton title="Enviar Foto do Documento" onPress={() => handleChange('docPhoto', 'mock_doc.jpg')} />
          <Text>{form.docPhoto ? 'Documento enviado' : 'Nenhum documento enviado'}</Text>
          <CustomButton title="Enviar Selfie com Documento" onPress={() => handleChange('selfiePhoto', 'mock_selfie.jpg')} />
          <Text>{form.selfiePhoto ? 'Selfie enviada' : 'Nenhuma selfie enviada'}</Text>
          <CustomButton title="Próximo" onPress={submitDocs} />
        </>
      )}

      {step === 'security' && (
        <>
          <Text style={styles.subtitle}>Configure sua segurança (PIN é obrigatório)</Text>
          <InputField placeholder="PIN (obrigatório)" value={form.pin} onChangeText={(v) => handleChange('pin', v)} secureTextEntry error={errors.pin} keyboardType="numeric" />
          <InputField placeholder="Senha (opcional)" value={form.password} onChangeText={(v) => handleChange('password', v)} secureTextEntry error={errors.password} />
          <ToggleSwitch label="Reconhecimento Facial (recomendado)" value={form.faceAuth} onValueChange={(v) => handleChange('faceAuth', v)} />
          <ToggleSwitch label="Biometria (impressão digital)" value={form.biometric} onValueChange={(v) => handleChange('biometric', v)} />
          <ToggleSwitch label="Geolocalização (raio delimitado)" value={form.geoAuth} onValueChange={(v) => handleChange('geoAuth', v)} />
          <Text style={styles.helpText}>Escolha pelo menos 2 fatores. O reconhecimento facial monitora o uso e protege sua carteira!</Text>
          <CustomButton title="Próximo" onPress={submitSecurity} />
        </>
      )}

      {step === 'terms' && (
        <>
          <Text style={styles.subtitle}>Aceite os Termos e Políticas</Text>
          <ToggleSwitch label="Aceito os Termos de Uso e Política de Privacidade" value={form.termsAccepted} onValueChange={(v) => handleChange('termsAccepted', v)} />
          <ToggleSwitch label="Autorizo consulta de dados (ex.: Serasa)" value={form.dataConsent} onValueChange={(v) => handleChange('dataConsent', v)} />
          <CustomButton title="Finalizar" onPress={submitTerms} />
        </>
      )}

      {step === 'validation' && (
        <Text style={styles.subtitle}>Validando sua conta...</Text>
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
  choiceContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginVertical: 10 },
  choice: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  choiceSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  helpText: { fontSize: 12, color: '#666', textAlign: 'center', marginVertical: 10 },
  secondaryButton: { backgroundColor: '#6c757d', marginTop: 5 },
});

export default RegisterScreen;