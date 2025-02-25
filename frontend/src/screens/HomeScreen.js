import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';

const HomeScreen = () => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require('../assets/wallet.png')} style={styles.logo} />
        <Text style={styles.title}>Bem-vindo à Neo Wallet!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 150, height: 150 },
  title: { fontSize: 24, marginTop: 20 },
});

export default HomeScreen;