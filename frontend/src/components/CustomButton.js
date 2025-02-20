import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabledButton, style]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '85%',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CustomButton;