import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COINMARKETCAP_API_KEY, RAPIDAPI_KEY } from '@env'; // Import environment variables
import { fetchBalance, fetchTransactions, sendMoney, exchangeAssets, depositMoney } from '../services/walletService';

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState({ BRL: 0, USD: 0, BTC: 0 });
  const [transactions, setTransactions] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [isWalletSelected, setIsWalletSelected] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [switchAnim] = useState(new Animated.Value(0));
  const [assets, setAssets] = useState([]);
  const [showAllAssets, setShowAllAssets] = useState(false);

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
      if (balanceData.success) setBalance(balanceData.balance);

      const transactionData = await fetchTransactions();
      if (transactionData.success) setTransactions(transactionData.transactions);

      // Fetch data from CoinMarketCap API
      const coinMarketCapResponse = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        {
          params: { start: 1, limit: 50, convert: 'USD' },
          headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY }, // Use environment variable
        }
      );

      const cryptoData = coinMarketCapResponse.data.data;

      // Fetch icons from Crypto Icon API
      const assetsWithIcons = await Promise.all(
        cryptoData.map(async (crypto) => {
          let logo = 'https://via.placeholder.com/32'; // Fallback image
          try {
            const cryptoIconResponse = await axios.get(
              `https://crypto-icon.p.rapidapi.com/get-icon/${crypto.symbol.toLowerCase()}`,
              {
                headers: {
                  'x-rapidapi-host': 'crypto-icon.p.rapidapi.com',
                  'x-rapidapi-key': RAPIDAPI_KEY, // Use environment variable
                },
              }
            );
            // Assuming the response contains the image URL directly (adjust if needed)
            logo = cryptoIconResponse.data || 'https://via.placeholder.com/32';
          } catch (error) {
            console.error(`Error fetching icon for ${crypto.symbol}:`, error.message);
          }

          return {
            id: crypto.id.toString(),
            name: crypto.name,
            symbol: crypto.symbol,
            price: crypto.quote.USD.price,
            change24h: crypto.quote.USD.percent_change_24h,
            logo,
            userAmount: balance[crypto.symbol] || 0, // Map user's balance if available
          };
        })
      );

      setAssets(assetsWithIcons);
    } catch (error) {
      console.error('HomeScreen: Erro ao carregar dados:', error.message);
      setBalance({ BRL: 1234.56, USD: 200, BTC: 0.05 });
      setTransactions([
        { id: '1', date: '2025-03-04', description: 'Supermercado', asset: 'BRL', amount: -150.00 },
        { id: '2', date: '2025-03-03', description: 'João', asset: 'BRL', amount: 200.00 },
      ]);
      setAssets([
        { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 78532.81, change24h: 2.59, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '2', name: 'Ethereum', symbol: 'ETH', price: 1868.09, change24h: 7.43, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '3', name: 'Tether', symbol: 'USDT', price: 0.9994, change24h: 0.03, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '4', name: 'Binance Coin', symbol: 'BNB', price: 530.66, change24h: 4.48, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '5', name: 'Solana', symbol: 'SOL', price: 118.93, change24h: 6.18, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '6', name: 'Dogecoin', symbol: 'DOGE', price: 0.16, change24h: 5.32, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        { id: '7', name: 'TRON', symbol: 'TRX', price: 0.23, change24h: 3.45, logo: 'https://via.placeholder.com/32', userAmount: 0 },
      ]);
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

  const handleAssetPress = (asset) => {
    navigation.navigate('AssetDetail', { asset });
  };

  const toggleAssetList = () => {
    setShowAllAssets(!showAllAssets);
  };

  if (!isReady) {
    return <View><Text>Carregando...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olá, Luiz!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.accountIcon}><Text style={styles.accountText}>LS</Text></View>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <TouchableOpacity style={styles.customSwitch} onPress={toggleSwitch}>
          <Animated.View style={[styles.switchThumb, {
            transform: [{
              translateX: switchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100],
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

      {isWalletSelected && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seus Ativos</Text>
            <TouchableOpacity onPress={toggleAssetList}>
              <Text style={styles.eyeIcon}>{showAllAssets ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={showAllAssets ? assets : assets.slice(0, 5)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.assetItem} onPress={() => handleAssetPress(item)}>
                <Image source={{ uri: item.logo }} style={styles.assetLogo} />
                <Text style={styles.assetSymbol}>{item.symbol}</Text>
                <Text style={styles.assetName}>{item.name}</Text>
                <Text style={styles.assetAmount}>{item.userAmount.toFixed(2)}</Text>
                <Text style={[styles.assetTrend, item.change24h >= 0 ? styles.trendUp : styles.trendDown]}>
                  {item.change24h >= 0 ? '↑' : '↓'} {Math.abs(item.change24h)}%
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </View>
      )}

      {isWalletSelected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {transactions.length ? transactions.map(tx => (
            <TransactionItem key={tx.id} date={tx.date} description={tx.description} amount={tx.amount} asset={tx.asset} />
          )) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
            </View>
          )}
          {transactions.length > 0 && <TouchableOpacity><Text style={styles.seeAllText}>Ver todas</Text></TouchableOpacity>}
        </View>
      )}

      {isWalletSelected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Widgets</Text>
          <Widget title="Gastos Mensais" content="R$ 450,00" />
          <Widget title="Metas" content="R$ 300/500" />
          <Widget title="Tendências do Mercado" content="BTC ↑ 2.5%" />
        </View>
      )}
    </ScrollView>
  );
};

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

const AssetDetailScreen = ({ route, navigation }) => {
  const { asset } = route.params;
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical`,
          {
            params: {
              symbol: asset.symbol,
              time_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
              interval: 'daily',
            },
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY }, // Use environment variable
          }
        );

        const historicalData = response.data.data.quotes.map(quote => ({
          time: new Date(quote.timestamp).toISOString().split('T')[0],
          value: quote.quote.USD.price,
        }));
        setChartData(historicalData);
      } catch (error) {
        console.error('Error fetching chart data:', error.message);
        setChartData([
          { time: '2025-03-01', value: 75000 },
          { time: '2025-03-02', value: 76000 },
          { time: '2025-03-03', value: 78000 },
          { time: '2025-03-04', value: 78532.81 },
        ]);
      }
    };

    fetchChartData();
  }, [asset.symbol]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailCard}>
        <Image source={{ uri: asset.logo }} style={styles.detailLogo} />
        <Text style={styles.detailTitle}>{asset.name} ({asset.symbol})</Text>
        <Text style={styles.detailPrice}>${asset.price.toFixed(2)}</Text>
        <Text style={styles.detailAmount}>Possuído: {asset.userAmount} {asset.symbol}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text>Gráfico de Preços</Text>
        {chartData.map((data, index) => (
          <Text key={index}>{data.time}: ${data.value}</Text>
        ))}
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Ações</Text>
        <Text>Enviar, Trocar, ou Guardar {asset.symbol}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
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
  switchTrack: { width: '100%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  switchThumb: { position: 'absolute', width: 100, height: 30, backgroundColor: '#3B82F6', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  switchLabel: { fontSize: 14, color: '#000000' },
  balanceCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  actionButtonContainer: { alignItems: 'center' },
  roundButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  buttonIcon: { fontSize: 20, color: '#fff' },
  buttonLabel: { fontSize: 12, color: '#1E3A8A', textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  eyeIcon: { fontSize: 20 },
  assetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  assetLogo: { width: 24, height: 24, marginRight: 10 },
  assetSymbol: { fontSize: 20, marginRight: 10 },
  assetName: { fontSize: 16, flex: 1 },
  assetAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  assetTrend: { fontSize: 16 },
  trendUp: { color: '#10B981' },
  trendDown: { color: '#EF4444' },
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
  detailCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  detailLogo: { width: 32, height: 32, marginBottom: 10 },
  detailTitle: { fontSize: 24, fontWeight: 'bold' },
  detailPrice: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  detailAmount: { fontSize: 16, color: '#666' },
  chartContainer: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  actionSection: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  backButton: { margin: 20, padding: 10, backgroundColor: '#3B82F6', borderRadius: 10, alignItems: 'center' },
  backButtonText: { color: '#fff', fontSize: 16 },
});

export { HomeScreen, AssetDetailScreen };