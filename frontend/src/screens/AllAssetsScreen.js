import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import axios from 'axios';
import { COINMARKETCAP_API_KEY } from '@env';

const AllAssetsScreen = ({ navigation }) => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const loadAllAssets = async () => {
      try {
        const quotesResponse = await axios.get(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
          {
            params: { start: 1, limit: 100, convert: 'USD' },
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
          }
        );

        const cryptoData = quotesResponse.data.data;
        const ids = Object.keys(cryptoData).join(',');
        const metadataResponse = await axios.get(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/info',
          {
            params: { id: ids },
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
          }
        );

        const metadata = metadataResponse.data.data;
        const assetsWithDetails = Object.values(cryptoData).map(crypto => ({
          id: crypto.id.toString(),
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.quote.USD.price,
          change24h: crypto.quote.USD.percent_change_24h,
          logo: metadata[crypto.id]?.logo || 'https://via.placeholder.com/32',
          userAmount: 0, // Simulated balance
        }));

        setAssets(assetsWithDetails);
      } catch (error) {
        console.error('AllAssetsScreen: Erro ao carregar dados:', error.message);
        setAssets([
          { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 78532.81, change24h: 2.59, logo: 'https://via.placeholder.com/32', userAmount: 0 },
          { id: '2', name: 'Ethereum', symbol: 'ETH', price: 1868.09, change24h: 7.43, logo: 'https://via.placeholder.com/32', userAmount: 0 },
          { id: '3', name: 'Toncoin', symbol: 'TON', price: 2.64, change24h: 5.12, logo: 'https://via.placeholder.com/32', userAmount: 0 },
        ]);
      }
    };

    loadAllAssets();
  }, []);

  const renderAsset = ({ item }) => {
    const valueInUSD = item.userAmount * item.price;
    return (
      <View style={styles.assetItem}>
        <Image source={{ uri: item.logo }} style={styles.assetLogo} />
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          {item.symbol !== 'USD' && item.symbol !== 'EUR' && item.symbol !== 'BRL' && (
            <Text style={styles.assetPrice}>
              ${item.price.toFixed(2)}{' '}
              <Text style={[styles.assetChange, item.change24h >= 0 ? styles.trendUp : styles.trendDown]}>
                {item.change24h >= 0 ? '↑' : '↓'} {Math.abs(item.change24h).toFixed(2)}%
              </Text>
            </Text>
          )}
        </View>
        <View style={styles.assetAmountContainer}>
          <Text style={styles.assetValue}>${valueInUSD.toFixed(2)}</Text>
          <Text style={styles.assetAmount}>{item.userAmount} {item.symbol}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={assets}
      renderItem={renderAsset}
      keyExtractor={item => item.id}
      style={styles.container}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Todos os Ativos</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
});

export default AllAssetsScreen;