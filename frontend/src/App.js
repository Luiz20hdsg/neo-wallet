import React, { useEffect, useState } from 'react'; // Adicionar useState aqui
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry } from 'react-native';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TokenResetScreen from './screens/TokenResetScreen';
import FaceMonitor from './components/FaceMonitor';

const Stack = createStackNavigator();

function SplashScreen({ navigation }) {
  useEffect(() => {
    console.log('SplashScreen: Iniciando');
    const timer = setTimeout(() => {
      console.log('SplashScreen: Redirecionando para Login');
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);
  return <HomeScreen />;
}

const App = () => {
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
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TokenReset" component={TokenResetScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      {isLoggedIn && <FaceMonitor />}
    </NavigationContainer>
  );
};

AppRegistry.registerComponent('main', () => App);

export default App;