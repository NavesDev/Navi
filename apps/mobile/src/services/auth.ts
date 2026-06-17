import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../config';

export const API_URL = Config.API_URL;


export interface AuthResponse {
  user: {
    id: number;
    username: string;
  };
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return this.handleResponse(response);
  },

  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return this.handleResponse(response);
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(response.status === 401 ? 'Unauthorized' : 'Failed to fetch profile');
    }
    return response.json();
  },

  async handleResponse(response: Response) {
    const data = await response.json();
    if (response.status === 429) {
      const error = new Error('RateLimitExceeded') as any;
      error.retryAfter = data.retry_after || 60;
      throw error;
    }
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  },

  async saveSession(token: string, username: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem('user_session_token', token);
      localStorage.setItem('user_username', username);
    } else {
      await SecureStore.setItemAsync('user_session_token', token);
      await SecureStore.setItemAsync('user_username', username);
    }
  },

  async clearSession() {
    if (Platform.OS === 'web') {
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('user_username');
    } else {
      await SecureStore.deleteItemAsync('user_session_token');
      await SecureStore.deleteItemAsync('user_username');
    }
  },

  async getSession() {
    if (Platform.OS === 'web') {
      const token = localStorage.getItem('user_session_token');
      const username = localStorage.getItem('user_username');
      if (token && username) {
        return { token, username };
      }
    } else {
      const token = await SecureStore.getItemAsync('user_session_token');
      const username = await SecureStore.getItemAsync('user_username');
      if (token && username) {
        return { token, username };
      }
    }
    return null;
  }
};
