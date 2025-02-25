import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FaceMonitor = ({ onLogout }) => {
  useEffect(() => {
    console.log('FaceMonitor: Iniciando monitoramento');
    const monitorFace = async () => {
      try {
        const faceAuth = await AsyncStorage.getItem('faceAuth') === 'true';
        console.log('FaceMonitor: faceAuth:', faceAuth);
        if (!faceAuth) return;

        const interval = setInterval(() => {
          const isOwner = Math.random() > 0.1; // Simulação
          console.log('FaceMonitor: Verificando rosto, isOwner:', isOwner);
          if (!isOwner) {
            if (Platform.OS === 'web') {
              window.alert('Usuário não reconhecido. Encerrando sessão.');
            } else {
              console.log('FaceMonitor: Usuário não reconhecido, encerrando sessão');
            }
            AsyncStorage.removeItem('token');
            if (onLogout) onLogout();
          }
        }, 10000);

        return () => {
          console.log('FaceMonitor: Parando monitoramento');
          clearInterval(interval);
        };
      } catch (error) {
        console.error('FaceMonitor: Erro ao verificar faceAuth:', error);
      }
    };
    monitorFace();
  }, [onLogout]);

  return null;
};

export default FaceMonitor;