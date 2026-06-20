import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, Image } from 'react-native';
import { authService } from '../../services/auth';
import { theme } from '../../styles/theme';
import { Surface } from '../../ui/Surface';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';

interface AuthScreenProps {
  onSuccess: (token: string, username: string) => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <Surface style={styles.card}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/navi-mark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Navi</Text>
      <Text style={styles.subheadline}>
        {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
      </Text>

      <TextField
        label="Nome de Usuário"
        placeholder="Insira seu usuário"
        value={username}
        onChangeText={setUsername}
        editable={!isSubmitting}
        autoCapitalize="none"
      />

      <TextField
        label="Senha"
        placeholder="Insira sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isSubmitting}
        autoCapitalize="none"
      />

      <Button
        variant="primary"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submitButton}
      >
        {authMode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
      </Button>

      <Button
        variant="secondary"
        onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        style={styles.switchButton}
      >
        {authMode === 'login'
          ? 'NÃO POSSUI CONTA? CADASTRE-SE'
          : 'JÁ POSSUI CONTA? FAÇA LOGIN'}
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.xl,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: theme.fonts.headline,
    fontSize: 32,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subheadline: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.secondary,
    textAlign: 'center',
    letterSpacing: theme.typography.labelLetterSpacing,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
  switchButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
});
