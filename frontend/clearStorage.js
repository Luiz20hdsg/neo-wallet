const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar AsyncStorage:', error);
  }
};

clearStorage();