import React, { useEffect, useState } from 'react';
import { AppRegistry, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import { HomeScreen, AssetDetailScreen } from './screens/HomeScreen';
import { fetchBalance } from './services/walletService';

const Stack = createStackNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      console.log('App: Verificando token');
      const token = await AsyncStorage.getItem('token');
      console.log('App: Token:', token);

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetchBalance();
        if (response.success) {
          setIsLoggedIn(true);
        } else {
          console.log('App: Token inválido, limpando...');
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('App: Erro ao verificar token:', error.message);
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    };

    checkToken();
  }, []);

  const clearToken = async () => {
    await AsyncStorage.removeItem('token');
    setIsLoggedIn(false);
    console.log('Token limpo');
  };

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <View style={{ flex: 1 }}>
          <Button title="Limpar Token (Debug)" onPress={clearToken} />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </View>
      ) : (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App;