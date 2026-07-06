import axios from 'axios';
import Constants from 'expo-constants';

import { useAuthStore } from './auth/store';

const getDevApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(':')?.[0];
  return `http://${host || 'localhost'}:8000/api/v1`;
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDevApiUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const auth = useAuthStore.getState().auth;
  const token = auth?.access_token || auth?.token || (typeof auth === 'string' ? auth : null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
