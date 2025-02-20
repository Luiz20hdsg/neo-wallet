import React from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';

const InputField = ({ placeholder, value, onChangeText, secureTextEntry, error }) => (
  <>
    <TextInput
      style={[styles.input, error && styles.errorInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </>
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    width: '85%',
    fontSize: 16,
  },
  errorInput: { borderColor: '#dc3545' },
  errorText: { color: '#dc3545', fontSize: 12, marginBottom: 5 },
});

export default InputField;