import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';

const ToggleSwitch = ({ label, value, onValueChange }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#ccc', true: '#28a745' }} />
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, width: '85%' },
  label: { fontSize: 16, flex: 1 },
});

export default ToggleSwitch;