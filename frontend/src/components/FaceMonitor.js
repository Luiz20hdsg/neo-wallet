import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FaceMonitor = () => {
  useEffect(() => {
    const monitorFace = async () => {
      const faceAuth = await AsyncStorage.getItem('faceAuth') === 'true';
      if (!faceAuth) return;

      const interval = setInterval(() => {
        // Simulação de monitoramento facial (substituir por visão real no futuro)
        const isOwner = Math.random() > 0.1; // 90% de chance de ser o dono (simulação)
        if (!isOwner) {
          Alert.alert('Aviso', 'Usuário não reconhecido. Encerrando sessão.');
          AsyncStorage.removeItem('token');
          // Forçar logout (necessita de contexto de navegação para ser mais robusto)
        }
      }, 10000); // Verifica a cada 10 segundos

      return () => clearInterval(interval);
    };
    monitorFace();
  }, []);

  return null; // Componente invisível
};

export default FaceMonitor;