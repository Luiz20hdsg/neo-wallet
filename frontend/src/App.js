import React, { useEffect, useState } from 'react';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    console.log('App: Verificando token');
    AsyncStorage.getItem('token')
      .then(token => {
        console.log('App: Token:', token);
        setIsLoggedIn(!!token);
      })
      .catch(error => {
        console.error('App: Erro no token:', error);
        setIsLoggedIn(false);
      });
  }, []);

  if (isLoggedIn === null) {
    return <Text>Carregando...</Text>; // Placeholder enquanto verifica o token
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App;