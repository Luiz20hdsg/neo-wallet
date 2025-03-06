import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FaceMonitor from '../components/FaceMonitor';
import { fetchBalance, fetchTransactions, sendMoney, exchangeAssets, depositMoney } from '../services/walletService';

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState({ BRL: 0, USD: 0, BTC: 0 });
  const [transactions, setTransactions] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isReady, setIsReady] = useState(false); // Controle de prontidão
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    console.log('HomeScreen: Iniciando carregamento');
    const timer = setTimeout(() => {
      setIsReady(true);
      loadData();
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }, 1000); // Delay para garantir ambiente pronto
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      console.log('HomeScreen: Tentando carregar dados');
      const balanceData = await fetchBalance();
      console.log('HomeScreen: Saldo recebido:', balanceData);
      if (balanceData.success) setBalance(balanceData.balance);
      const transactionData = await fetchTransactions();
      console.log('HomeScreen: Transações recebidas:', transactionData);
      if (transactionData.success) setTransactions(transactionData.transactions);
    } catch (error) {
      console.error('HomeScreen: Erro ao carregar dados:', error.message);
      // Usa valores padrão como fallback
      setBalance({ BRL: 1234.56, USD: 200, BTC: 0.05 });
      setTransactions([
        { id: '1', date: '2025-03-04', description: 'Supermercado', asset: 'BRL', amount: -150.00 },
        { id: '2', date: '2025-03-03', description: 'João', asset: 'BRL', amount: 200.00 },
      ]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  const handleAssetPress = (asset) => setSelectedAsset(selectedAsset === asset ? null : asset);

  if (!isReady) {
    return <View><Text>Carregando...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Olá, Luiz!</Text>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.accountIcon}><Text style={styles.accountText}>LS</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.switchContainer}>
          <TouchableOpacity style={[styles.switchButton, !selectedAsset && styles.switchActive]} onPress={() => setSelectedAsset(null)}>
            <Text style={styles.switchText}>Carteira</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.switchButton, selectedAsset && styles.switchActive]}>
            <Text style={styles.switchText}>Tokenização</Text>
          </TouchableOpacity>
        </View>

        {!selectedAsset && (
          <View style={styles.balanceCard}>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              <Text style={styles.balanceLabel}>Saldo Disponível</Text>
              <Text style={styles.balanceValue}>{hideBalance ? '****' : `R$ ${balance.BRL.toFixed(2)}`}</Text>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <CustomButton title="Enviar" icon="send" onPress={() => sendMoney({ to: 'joao@email.com', asset: 'BRL', amount: 50 })} />
              <CustomButton title="Receber" icon="download" />
              <CustomButton title="Trocar" icon="repeat" onPress={() => exchangeAssets({ fromAsset: 'BRL', toAsset: 'BTC', amount: 100 })} />
              <CustomButton title="Pagar" icon="credit-card" />
              <CustomButton title="Recarregar" icon="plus-circle" onPress={() => depositMoney({ asset: 'BRL', amount: 100 })} />
            </View>
          </View>
        )}

        {!selectedAsset && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Ativos</Text>
            {Object.entries(balance).map(([asset, amount]) => (
              <AssetItem key={asset} asset={asset} amount={amount} onPress={() => handleAssetPress(asset)} />
            ))}
          </View>
        )}

        {selectedAsset && (
          <View style={styles.assetDetail}>
            <Text style={styles.assetTitle}>{selectedAsset}</Text>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceValue}>{hideBalance ? '****' : `${balance[selectedAsset].toFixed(2)} ${selectedAsset}`}</Text>
              <View style={styles.actionRow}>
                <CustomButton title="Enviar" icon="send" />
                <CustomButton title="Receber" icon="download" />
                <CustomButton title="Trocar" icon="repeat" />
                <CustomButton title="Pagar" icon="credit-card" />
                <CustomButton title="Recarregar" icon="plus-circle" />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Gráfico</Text>
            <View style={styles.graphPlaceholder}><Text>Gráfico Placeholder</Text></View>
            <Text style={styles.sectionTitle}>Informações</Text>
            <Text style={styles.infoText}>{`Sobre ${selectedAsset}: Informações fictícias.`}</Text>
            <CustomButton title="Simular Conversão" icon="calculator" />
            <CustomButton title="Voltar" icon="arrow-left" onPress={() => setSelectedAsset(null)} style={styles.backButton} />
          </View>
        )}

        {!selectedAsset && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            {transactions.length ? transactions.map(tx => (
              <TransactionItem key={tx.id} date={tx.date} description={tx.description} amount={tx.amount} asset={tx.asset} />
            )) : (
              <View style={styles.emptyContainer}>
                <Icon name="activity" size={40} color="#666" />
                <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                <CustomButton title="Voltar à Tela Inicial" onPress={() => {}} />
              </View>
            )}
            {transactions.length > 0 && <TouchableOpacity><Text style={styles.seeAllText}>Ver todas</Text></TouchableOpacity>}
          </View>
        )}

        {!selectedAsset && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Widgets</Text>
            <Widget title="Gastos Mensais" content="R$ 450,00" />
            <Widget title="Metas" content="R$ 300/500" />
            <Widget title="Tendências do Mercado" content="BTC ↑ 2.5%" />
          </View>
        )}

        <FaceMonitor onLogout={handleLogout} />
      </Animated.View>
    </ScrollView>
  );
};

const CustomButton = ({ title, icon, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Icon name={icon} size={20} color="#fff" />
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const AssetItem = ({ asset, amount, onPress }) => (
  <TouchableOpacity style={styles.assetItem} onPress={onPress}>
    <Text style={styles.assetSymbol}>{asset === 'BRL' ? 'R$' : asset === 'USD' ? '$' : '₿'}</Text>
    <Text style={styles.assetName}>{asset}</Text>
    <Text style={styles.assetAmount}>{amount.toFixed(2)}</Text>
    <Icon name={Math.random() > 0.5 ? 'trending-up' : 'trending-down'} size={20} color={Math.random() > 0.5 ? '#10B981' : '#EF4444'} />
  </TouchableOpacity>
);

const TransactionItem = ({ date, description, amount, asset }) => (
  <View style={styles.transactionItem}>
    <Text style={styles.transactionDate}>{date}</Text>
    <Text style={styles.transactionDescription}>{description}</Text>
    <Text style={[styles.transactionAmount, { color: amount > 0 ? '#10B981' : '#EF4444' }]}>{amount > 0 ? '+' : ''}{amount.toFixed(2)} {asset}</Text>
  </View>
);

const Widget = ({ title, content }) => (
  <View style={styles.widget}>
    <Text style={styles.widgetTitle}>{title}</Text>
    <Text style={styles.widgetContent}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#3B82F6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  accountIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  accountText: { fontSize: 18, color: '#3B82F6' },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#E5E7EB' },
  switchButton: { padding: 10, flex: 1, alignItems: 'center' },
  switchActive: { backgroundColor: '#3B82F6' },
  switchText: { color: '#fff' },
  balanceCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { flex: 1, marginHorizontal: 5, backgroundColor: '#3B82F6', paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 12, marginLeft: 5 },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  assetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  assetSymbol: { fontSize: 20, marginRight: 10 },
  assetName: { fontSize: 16, flex: 1 },
  assetAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  assetDetail: { margin: 20 },
  assetTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  graphPlaceholder: { height: 150, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  infoText: { fontSize: 14, color: '#666', marginVertical: 10 },
  backButton: { backgroundColor: '#6B7280', marginTop: 10 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  transactionDate: { fontSize: 14, color: '#666' },
  transactionDescription: { fontSize: 14, flex: 1, marginHorizontal: 10 },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', marginVertical: 10 },
  seeAllText: { color: '#3B82F6', textAlign: 'center', marginTop: 10 },
  widget: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  widgetTitle: { fontSize: 16, fontWeight: 'bold' },
  widgetContent: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default HomeScreen;