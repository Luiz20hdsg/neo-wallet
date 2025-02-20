import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  useEffect(() => {
    const loadUser = async () => {
      const email = await AsyncStorage.getItem('email'); // Simulação, ajustar com dados reais
      setUserName(email ? email.split('@')[0] : 'Usuário');
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start();
    };
    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
        <Image source={require('../assets/wallet.png')} style={styles.logo} />
        <Text style={styles.title}>Bem-vindo, {userName}!</Text>
        <Text style={styles.subtitle}>Sua carteira Neo Wallet está pronta.</Text>
      </Animated.View>
      <CustomButton title="Sair" onPress={logout} style={styles.logoutButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
  logoutButton: { backgroundColor: '#dc3545', marginTop: 20 },
});

export default HomeScreen;