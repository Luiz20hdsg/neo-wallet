import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const AuthFeedback = ({ message, success }) => {
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [message]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: success ? '#28a745' : '#dc3545' }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, borderRadius: 8, marginVertical: 10, width: '85%', alignItems: 'center' },
  text: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default AuthFeedback;