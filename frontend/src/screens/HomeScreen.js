import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COINMARKETCAP_API_KEY } from '@env';
import { fetchBalance, fetchTransactions, sendMoney, exchangeAssets, depositMoney } from '../services/walletService';

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState({ BRL: 0, USD: 0, BTC: 0 });
  const [transactions, setTransactions] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [isWalletSelected, setIsWalletSelected] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [switchAnim] = useState(new Animated.Value(0));
  const [assets, setAssets] = useState([]);
  const [visibleAssetsCount, setVisibleAssetsCount] = useState(5);

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

      // Fetch cryptocurrency metadata and quotes from CoinMarketCap
      const infoResponse = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/info',
        {
          params: { start: 1, limit: 50 },
          headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
        }
      );

      const quotesResponse = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
          params: { start: 1, limit: 50, convert: 'USD' },
          headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
        }
      );

      const cryptoInfo = infoResponse.data.data;
      const cryptoQuotes = quotesResponse.data.data;

      // Combine data with API-provided logos and metadata
      const assetsWithDetails = Object.entries(cryptoQuotes).map(([id, crypto]) => {
        const symbol = crypto.symbol.toUpperCase();
        const info = cryptoInfo[id] || {};
        const logoUrl = info.logo || 'https://via.placeholder.com/24'; // Fallback logo if missing
        return {
          id: id.toString(),
          name: info.name || crypto.name,
          symbol: symbol,
          price: crypto.quote.USD.price,
          change24h: crypto.quote.USD.percent_change_24h,
          logo: { uri: logoUrl }, // Use URI for remote images
          userAmount: balance[symbol] || 0, // Simulated balance
          address: info.contract_address || null, // Contract address (if available)
          decimals: info.platform?.decimals || null, // Decimals (if available)
          chainId: info.platform?.chain_id || null, // Chain ID (if available)
          chainName: info.platform?.name || null, // Chain name (if available)
        };
      });

      // Prioritize fiat currencies (USD, EUR, BRL) first
      const fiatSymbols = ['USD', 'EUR', 'BRL'];
      const prioritizedAssets = [
        ...assetsWithDetails.filter(asset => fiatSymbols.includes(asset.symbol)),
        ...assetsWithDetails.filter(asset => !fiatSymbols.includes(asset.symbol)),
      ];

      setAssets(prioritizedAssets);
    } catch (error) {
      console.error('HomeScreen: Erro ao carregar dados:', error.message);
      setBalance({ BRL: 1234.56, USD: 200, BTC: 0.05 });
      setTransactions([
        { id: '1', date: '2025-03-04', description: 'Supermercado', asset: 'BRL', amount: -150.00 },
        { id: '2', date: '2025-03-03', description: 'João', asset: 'BRL', amount: 200.00 },
      ]);
      setAssets([
        { id: '1', name: 'US Dollar', symbol: 'USD', price: 1.00, change24h: 0.00, logo: { uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' }, userAmount: 200, address: null, decimals: null, chainId: null, chainName: null },
        { id: '2', name: 'Euro', symbol: 'EUR', price: 0.92, change24h: 0.00, logo: { uri: 'https://via.placeholder.com/24' }, userAmount: 0, address: null, decimals: null, chainId: null, chainName: null },
        { id: '3', name: 'Real', symbol: 'BRL', price: 5.10, change24h: 0.00, logo: { uri: 'https://via.placeholder.com/24' }, userAmount: 1234.56, address: null, decimals: null, chainId: null, chainName: null },
        { id: '4', name: 'Bitcoin', symbol: 'BTC', price: 78532.81, change24h: 2.59, logo: { uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' }, userAmount: 0.05, address: null, decimals: null, chainId: null, chainName: null },
        { id: '5', name: 'Ethereum', symbol: 'ETH', price: 1868.09, change24h: 7.43, logo: { uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' }, userAmount: 0, address: null, decimals: null, chainId: null, chainName: null },
        { id: '6', name: 'Toncoin', symbol: 'TON', price: 2.64, change24h: 5.12, logo: { uri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png' }, userAmount: 0, address: null, decimals: null, chainId: null, chainName: null },
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

  const showMoreAssets = () => {
    setVisibleAssetsCount(10);
  };

  const showLessAssets = () => {
    setVisibleAssetsCount(5);
  };

  const viewAllAssets = () => {
    navigation.navigate('AllAssets');
  };

  const sections = [
    { type: 'header', key: 'header' },
    { type: 'switch', key: 'switch' },
    ...(isWalletSelected ? [
      { type: 'balance', key: 'balance' },
      { type: 'assetsHeader', key: 'assetsHeader' },
      ...assets.slice(0, visibleAssetsCount).map(asset => ({ type: 'asset', key: asset.id, data: asset })),
      { type: 'assetControls', key: 'assetControls' },
      { type: 'transactionsHeader', key: 'transactionsHeader' },
      ...(transactions.length ? transactions.map(tx => ({ type: 'asset', key: tx.id, data: tx })) : [{ type: 'emptyTransactions', key: 'emptyTransactions' }]),
      ...(transactions.length > 0 ? [{ type: 'seeAllTransactions', key: 'seeAllTransactions' }] : []),
      { type: 'widgetsHeader', key: 'widgetsHeader' },
      { type: 'widget', key: 'widget1', data: { title: 'Gastos Mensais', content: 'R$ 450,00' } },
      { type: 'widget', key: 'widget2', data: { title: 'Metas', content: 'R$ 300/500' } },
      { type: 'widget', key: 'widget3', data: { title: 'Tendências do Mercado', content: 'BTC ↑ 2.5%' } },
    ] : []),
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Olá, Luiz!</Text>
            <TouchableOpacity onPress={handleLogout}>
              <View style={styles.accountIcon}><Text style={styles.accountText}>LS</Text></View>
            </TouchableOpacity>
          </View>
        );
      case 'switch':
        return (
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
        );
      case 'balance':
        return (
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
        );
      case 'assetsHeader':
        return <Text style={styles.sectionTitle}>Seus Ativos</Text>;
      case 'asset':
        const { data } = item;
        const valueInUSD = data.userAmount * data.price;
        return (
          <TouchableOpacity style={styles.assetItem} onPress={() => handleAssetPress(data)}>
            <Image source={data.logo} style={styles.assetLogo} />
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{data.name}</Text>
              {data.symbol !== 'USD' && data.symbol !== 'EUR' && data.symbol !== 'BRL' && (
                <Text style={styles.assetPrice}>
                  ${data.price.toFixed(2)}{' '}
                  <Text style={[styles.assetChange, data.change24h >= 0 ? styles.trendUp : styles.trendDown]}>
                    {data.change24h >= 0 ? '↑' : '↓'} {Math.abs(data.change24h).toFixed(2)}%
                  </Text>
                </Text>
              )}
            </View>
            <View style={styles.assetAmountContainer}>
              <Text style={styles.assetValue}>${valueInUSD.toFixed(2)}</Text>
              <Text style={styles.assetAmount}>{data.userAmount} {data.symbol}</Text>
            </View>
          </TouchableOpacity>
        );
      case 'assetControls':
        return (
          <View style={styles.assetControls}>
            {visibleAssetsCount === 5 && (
              <TouchableOpacity style={styles.controlButton} onPress={showMoreAssets}>
                <Text style={styles.controlButtonText}>Mais Ativos</Text>
              </TouchableOpacity>
            )}
            {visibleAssetsCount === 10 && (
              <TouchableOpacity style={styles.controlButton} onPress={showLessAssets}>
                <Text style={styles.controlButtonText}>Ver Menos Ativos</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.controlButton} onPress={viewAllAssets}>
              <Text style={styles.controlButtonText}>Ver Todos os Ativos</Text>
            </TouchableOpacity>
          </View>
        );
      case 'transactionsHeader':
        return <Text style={styles.sectionTitle}>Histórico</Text>;
      case 'transaction':
        return <TransactionItem date={item.data.date} description={item.data.description} amount={item.data.amount} asset={item.data.asset} />;
      case 'emptyTransactions':
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
          </View>
        );
      case 'seeAllTransactions':
        return <TouchableOpacity><Text style={styles.seeAllText}>Ver todas</Text></TouchableOpacity>;
      case 'widgetsHeader':
        return <Text style={styles.sectionTitle}>Widgets</Text>;
      case 'widget':
        return <Widget title={item.data.title} content={item.data.content} />;
      default:
        return null;
    }
  };

  if (!isReady) {
    return <View><Text>Carregando...</Text></View>;
  }

  return (
    <FlatList
      data={sections}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      style={styles.container}
    />
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
              time_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              interval: 'daily',
            },
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
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
    <FlatList
      data={[
        { type: 'detailCard', key: 'detailCard' },
        { type: 'chart', key: 'chart' },
        { type: 'actionSection', key: 'actionSection' },
        { type: 'backButton', key: 'backButton' },
      ]}
      renderItem={({ item }) => {
        switch (item.type) {
          case 'detailCard':
            return (
              <View style={styles.detailCard}>
                <Image source={asset.logo} style={styles.detailLogo} />
                <Text style={styles.detailTitle}>{asset.name} ({asset.symbol})</Text>
                <Text style={styles.detailPrice}>${asset.price.toFixed(2)}</Text>
                <Text style={styles.detailAmount}>Possuído: {asset.userAmount} {asset.symbol}</Text>
                {asset.address && <Text style={styles.detailText}>Contract: {asset.address}</Text>}
                {asset.decimals && <Text style={styles.detailText}>Decimals: {asset.decimals}</Text>}
                {asset.chainId && <Text style={styles.detailText}>Chain ID: {asset.chainId}</Text>}
                {asset.chainName && <Text style={styles.detailText}>Chain: {asset.chainName}</Text>}
              </View>
            );
          case 'chart':
            return (
              <View style={styles.chartContainer}>
                <Text>Gráfico de Preços</Text>
                {chartData.map((data, index) => (
                  <Text key={index}>{data.time}: ${data.value}</Text>
                ))}
              </View>
            );
          case 'actionSection':
            return (
              <View style={styles.actionSection}>
                <Text style={styles.actionTitle}>Ações</Text>
                <Text>Enviar, Trocar, ou Guardar {asset.symbol}</Text>
              </View>
            );
          case 'backButton':
            return (
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            );
          default:
            return null;
        }
      }}
      keyExtractor={item => item.key}
      style={styles.container}
    />
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
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginHorizontal: 20 },
  assetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  assetLogo: { width: 24, height: 24, marginRight: 10 },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 16, fontWeight: 'bold' },
  assetPrice: { fontSize: 14, color: '#666' },
  assetChange: { fontSize: 14 },
  assetAmountContainer: { alignItems: 'flex-end' },
  assetValue: { fontSize: 14, color: '#666' },
  assetAmount: { fontSize: 16, fontWeight: 'bold' },
  trendUp: { color: '#10B981' },
  trendDown: { color: '#EF4444' },
  assetControls: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10 },
  controlButton: { padding: 10, backgroundColor: '#3B82F6', borderRadius: 5 },
  controlButtonText: { color: '#fff', fontSize: 14 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  transactionDate: { fontSize: 14, color: '#666' },
  transactionDescription: { fontSize: 14, flex: 1, marginHorizontal: 10 },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', marginVertical: 10 },
  seeAllText: { color: '#3B82F6', textAlign: 'center', marginTop: 10, marginHorizontal: 20 },
  widget: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, marginHorizontal: 20 },
  widgetTitle: { fontSize: 16, fontWeight: 'bold' },
  widgetContent: { fontSize: 14, color: '#666', marginTop: 5 },
  detailCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  detailLogo: { width: 32, height: 32, marginBottom: 10 },
  detailTitle: { fontSize: 24, fontWeight: 'bold' },
  detailPrice: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  detailAmount: { fontSize: 16, color: '#666' },
  detailText: { fontSize: 14, color: '#666', marginVertical: 2 },
  chartContainer: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  actionSection: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  actionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  backButton: { margin: 20, padding: 10, backgroundColor: '#3B82F6', borderRadius: 10, alignItems: 'center' },
  backButtonText: { color: '#fff', fontSize: 16 },
});

export { HomeScreen, AssetDetailScreen };