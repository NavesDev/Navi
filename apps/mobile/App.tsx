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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { useFonts, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

// Prevent the splash screen from auto-hiding before asset/font loading is complete
SplashScreen.preventAutoHideAsync();

// Dynamic API URL detection based on Expo's hostUri (essential for physical devices on same Wi-Fi)
const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':').shift();
    return `http://${ip}:3000/api/v1`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
};

const API_URL = getApiUrl();

export default function App() {
  // Navigation & Authentication states
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  // Auth Form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  // Profile data test states
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load custom fonts using expo-font / @expo-google-fonts
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Restore session token on app startup
  useEffect(() => {
    async function restoreSession() {
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
        setIsSessionRestoring(false);
      }
    }
    restoreSession();
  }, []);

  // Hide the splash screen once fonts are loaded and session restore check completes
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isSessionRestoring) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isSessionRestoring]);

  // Handle Login or Registration submission
  const handleAuth = async () => {
    if (!inputUsername.trim() || !inputPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
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
        Alert.alert('Limite de Acesso Excedido', `Muitas tentativas. Tente novamente em ${retryAfter} segundos.`);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro de Autenticação', data.error || 'Credenciais inválidas ou dados incorretos.');
        setIsSubmitting(false);
        return;
      }

      // Persist user token and metadata securely
      await SecureStore.setItemAsync('user_session_token', data.token);
      await SecureStore.setItemAsync('user_username', data.user.username);

      setUserToken(data.token);
      setUsername(data.user.username);
      
      // Clear credentials form
      setInputUsername('');
      setInputPassword('');
      setProfileData(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível estabelecer contato com o servidor da API.');
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
      console.error('Failed to clear session token', e);
    }
  };

  // Test authenticated profile query
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

  // Render loading screen if fonts or initial session restore is not ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {userToken ? (
              // Logged In Dashboard View (Quiet Luxury layout)
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardView: {
    flex: 1,
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
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    color: '#D4C5B9',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#C6C6C6',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#C6C6C6',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_600SemiBold',
    color: '#0A0A0A',
    fontSize: 13,
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
    fontFamily: 'Inter_500Medium',
    color: '#C6C6C6',
    fontSize: 11,
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
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#D4C5B9',
    marginTop: 4,
  },
  buttonSpacing: {
    height: 8,
  },
});
