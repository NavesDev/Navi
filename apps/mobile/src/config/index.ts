import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiUrl = (): string => {
  // Read the environment variable configured via .env
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

  if (configuredUrl) {
    // In development mode, if the URL points to localhost or 127.0.0.1,
    // dynamically swap it with the Expo host IP when running on Android emulator or physical device.
    if (__DEV__) {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const ip = hostUri.split(':').shift();
        if (ip && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
          return configuredUrl.replace(/localhost|127\.0\.0\.1/, ip);
        }
      }
      // Fallback for Android emulator local dev
      if (Platform.OS === 'android' && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
        return configuredUrl.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
      }
    }
    return configuredUrl;
  }

  // Fallback default API URL if EXPO_PUBLIC_API_URL is not set at all
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':').shift();
    return `http://${ip}:3000/api/v1`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
};

export const Config = {
  API_URL: getApiUrl(),
};
