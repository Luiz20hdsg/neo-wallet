import * as Location from 'expo-location';

export const checkGeoLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Permissão de localização negada');

  const location = await Location.getCurrentPositionAsync({});
  const allowedLat = -23.550520; // Exemplo (São Paulo)
  const allowedLng = -46.633308;
  const radius = 1000; // 1km

  const distance = getDistance(location.coords.latitude, location.coords.longitude, allowedLat, allowedLng);
  return distance <= radius;
};

// Fórmula de Haversine para calcular distância em metros
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};