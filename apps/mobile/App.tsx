import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Configure standard API base URL for Android emulator vs iOS/web
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api/v1' 
  : 'http://localhost:3000/api/v1';

export default function App() {
  // Navigation & Authentication states
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  // Auth Form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  // Authenticated state check
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load persisted session on app startup
  useEffect(() => {
    async function bootstrapAsync() {
      try {
        const token = await SecureStore.getItemAsync('user_session_token');
        const savedUsername = await SecureStore.getItemAsync('user_username');
        if (token && savedUsername) {
          setUserToken(token);
          setUsername(savedUsername);
        }
      } catch (e) {
        console.error('Failed to restore session token', e);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrapAsync();
  }, []);

  // Handle Login or Registration submission
  const handleAuth = async () => {
    if (!inputUsername.trim() || !inputPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: inputUsername.trim(),
          password: inputPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        const retryAfter = data.retry_after || 60;
        Alert.alert('Limite Excedido', `Muitas tentativas. Tente novamente em ${retryAfter} segundos.`);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro', data.error || 'Ocorreu um erro. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      // Persist session tokens
      await SecureStore.setItemAsync('user_session_token', data.token);
      await SecureStore.setItemAsync('user_username', data.user.username);

      // Update local state
      setUserToken(data.token);
      setUsername(data.user.username);
      
      // Clear form inputs
      setInputUsername('');
      setInputPassword('');
      setProfileData(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor da API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('user_session_token');
      await SecureStore.deleteItemAsync('user_username');
      setUserToken(null);
      setUsername(null);
      setProfileData(null);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  };

  // Test authenticated /me endpoint
  const checkProfile = async () => {
    if (!userToken) return;
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setProfileData(data);
      } else {
        Alert.alert('Não Autorizado', 'Sua sessão expirou ou é inválida.');
        handleLogout();
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível buscar dados do perfil.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4C5B9" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {userToken ? (
          // Logged In Dashboard View
          <View style={styles.card}>
            <Text style={styles.headline}>Navi 🌌</Text>
            <Text style={styles.welcomeText}>Bem-vindo, {username}!</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>Sessão Ativa</Text>
            <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="tail">
              {userToken}
            </Text>

            {profileData && (
              <View style={styles.profileContainer}>
                <Text style={styles.label}>Resposta de /auth/me:</Text>
                <Text style={styles.profileDataText}>
                  ID: {profileData.id} | Usuário: {profileData.username}
                </Text>
              </View>
            )}

            <View style={styles.buttonSpacing} />

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={checkProfile}
              disabled={isLoadingProfile}
            >
              {isLoadingProfile ? (
                <ActivityIndicator size="small" color="#0A0A0A" />
              ) : (
                <Text style={styles.primaryButtonText}>VERIFICAR PERFIL (/me)</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleLogout}
            >
              <Text style={styles.secondaryButtonText}>SAIR DA CONTA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Login / Registration Form View
          <View style={styles.card}>
            <Text style={styles.headline}>Navi 🌌</Text>
            <Text style={styles.subheadline}>
              {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>NOME DE USUÁRIO</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'username' && styles.inputFocused
                ]}
                placeholder="Insira seu usuário"
                placeholderTextColor="#454747"
                value={inputUsername}
                onChangeText={setInputUsername}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>SENHA</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused
                ]}
                placeholder="Insira sua senha"
                placeholderTextColor="#454747"
                secureTextEntry
                value={inputPassword}
                onChangeText={setInputPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0A0A0A" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {authMode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              <Text style={styles.secondaryButtonText}>
                {authMode === 'login' 
                  ? 'NÃO POSSUI CONTA? CADASTRE-SE' 
                  : 'JÁ POSSUI CONTA? FAÇA LOGIN'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 4,
    padding: 24,
    elevation: 0,
  },
  headline: {
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    fontSize: 32,
    color: '#D4C5B9',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#C6C6C6',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#E5E2E1',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    color: '#C6C6C6',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    color: '#E5E2E1',
    fontSize: 16,
    paddingVertical: 8,
  },
  inputFocused: {
    borderBottomColor: '#D4C5B9',
  },
  primaryButton: {
    backgroundColor: '#D4C5B9',
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  secondaryButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#C6C6C6',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  tokenText: {
    fontSize: 12,
    color: '#8C8C8C',
    backgroundColor: '#131313',
    padding: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  profileContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 2,
  },
  profileDataText: {
    fontSize: 14,
    color: '#D4C5B9',
    marginTop: 4,
  },
  buttonSpacing: {
    height: 8,
  },
});
