import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { authService } from '../services/auth';
import { theme, globalStyles } from '../styles/theme';

interface AuthFormProps {
  onSuccess: (token: string, username: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await (authMode === 'login'
        ? authService.login(username.trim(), password)
        : authService.register(username.trim(), password));

      await authService.saveSession(data.token, data.user.username);
      onSuccess(data.token, data.user.username);
      
      setUsername('');
      setPassword('');
    } catch (error: any) {
      if (error.message === 'RateLimitExceeded' || error.retryAfter) {
        Alert.alert(
          'Limite Excedido',
          `Muitas tentativas. Tente novamente em ${error.retryAfter || 60} segundos.`
        );
      } else {
        Alert.alert('Erro de Autenticação', error.message || 'Credenciais inválidas.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.headline}>Navi 🌌</Text>
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
          value={username}
          onChangeText={setUsername}
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
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleSubmit}
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
  );
};

const styles = StyleSheet.create({
  subheadline: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.secondary,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    fontFamily: theme.fonts.body,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    color: theme.colors.onSurface,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputFocused: {
    borderBottomColor: theme.colors.primaryContainer,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryContainer,
    height: 48,
    borderRadius: theme.rounded.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: theme.fonts.semibold,
    color: '#0A0A0A',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.secondary,
    fontSize: 11,
    letterSpacing: 1,
  },
});
