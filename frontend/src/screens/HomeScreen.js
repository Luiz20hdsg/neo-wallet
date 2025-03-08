import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBalance, sendMoney, exchangeAssets, depositMoney } from '../services/walletService';

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState({ BRL: 0, USD: 0, BTC: 0 });
  const [hideBalance, setHideBalance] = useState(false);
  const [isWalletSelected, setIsWalletSelected] = useState(true); // true para Carteira, false para Tokenização
  const [isReady, setIsReady] = useState(false);
  const [switchAnim] = useState(new Animated.Value(0)); // Para animação do switch

  useEffect(() => {
    console.log('HomeScreen: Iniciando carregamento');
    const timer = setTimeout(() => {
      setIsReady(true);
      loadData();
      animateSwitch();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      console.log('HomeScreen: Tentando carregar dados');
      const balanceData = await fetchBalance();
      console.log('HomeScreen: Saldo recebido:', balanceData);
      if (balanceData.success) setBalance(balanceData.balance);
    } catch (error) {
      console.error('HomeScreen: Erro ao carregar dados:', error.message);
      setBalance({ BRL: 1234.56, USD: 200, BTC: 0.05 });
    }
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  const animateSwitch = () => {
    Animated.timing(switchAnim, {
      toValue: isWalletSelected ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleSwitch = () => {
    setIsWalletSelected(!isWalletSelected);
    animateSwitch();
  };

  if (!isReady) {
    return <View><Text>Carregando...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {console.log('HomeScreen: Renderizando header')}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olá, Luiz!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.accountIcon}><Text style={styles.accountText}>LS</Text></View>
        </TouchableOpacity>
      </View>

      {console.log('HomeScreen: Renderizando switchContainer')}
      <View style={styles.switchContainer}>
        <TouchableOpacity style={styles.customSwitch} onPress={toggleSwitch}>
          <Animated.View style={[styles.switchThumb, {
            transform: [{
              translateX: switchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100], // Distância entre Carteira e Tokenização
              }),
            }],
          }]}>
            <Text style={styles.switchText}>{isWalletSelected ? 'Carteira' : 'Tokenização'}</Text>
          </Animated.View>
          <View style={styles.switchTrack}>
            <Text style={styles.switchLabel}>Carteira</Text>
            <Text style={styles.switchLabel}>Tokenização</Text>
          </View>
        </TouchableOpacity>
      </View>

      {console.log('HomeScreen: Renderizando balanceCard')}
      {isWalletSelected && (
        <View style={styles.balanceCard}>
          <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
            <Text style={styles.balanceLabel}>Saldo Disponível</Text>
            <Text style={styles.balanceValue}>{hideBalance ? '****' : `R$ ${balance.BRL.toFixed(2)}`}</Text>
          </TouchableOpacity>
          <View style={styles.actionRow}>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.roundButton} onPress={() => sendMoney({ to: 'joao@email.com', asset: 'BRL', amount: 50 })}>
                <Text style={styles.buttonIcon}>➡️</Text>
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Send</Text>
            </View>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.roundButton}>
                <Text style={styles.buttonIcon}>⬇️</Text>
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Receive</Text>
            </View>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.roundButton} onPress={() => exchangeAssets({ fromAsset: 'BRL', toAsset: 'BTC', amount: 100 })}>
                <Text style={styles.buttonIcon}>↔️</Text>
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Swap</Text>
            </View>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.roundButton}>
                <Text style={styles.buttonIcon}>💳</Text>
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Pay</Text>
            </View>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.roundButton} onPress={() => depositMoney({ asset: 'BRL', amount: 100 })}>
                <Text style={styles.buttonIcon}>➕</Text>
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Recharge</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#3B82F6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  accountIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  accountText: { fontSize: 18, color: '#3B82F6' },
  switchContainer: { padding: 10, alignItems: 'center' },
  customSwitch: { width: 200, height: 40, justifyContent: 'center', position: 'relative' },
  switchTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF', // Fundo branco
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  switchThumb: {
    position: 'absolute',
    width: 100,
    height: 30,
    backgroundColor: '#3B82F6', // Movedor na cor azul da aplicação
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: { fontSize: 14, color: '#fff', fontWeight: 'bold' }, // Texto dentro do movedor (branco)
  switchLabel: { fontSize: 14, color: '#000000' }, // Texto "Carteira" e "Tokenização" em preto
  balanceCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  actionButtonContainer: { alignItems: 'center' },
  roundButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  buttonIcon: { fontSize: 20, color: '#fff' },
  buttonLabel: { fontSize: 12, color: '#1E3A8A', textAlign: 'center' },
});

export default HomeScreen;