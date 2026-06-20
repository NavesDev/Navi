import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '../../services/auth';
import { theme } from '../../styles/theme';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Surface } from '../../ui/Surface';
import { Button } from '../../ui/Button';
import { LoadingState } from '../../ui/LoadingState';

interface SettingsScreenProps {
  token: string;
  onLogout: () => void;
}

export function SettingsScreen({ token, onLogout }: SettingsScreenProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authService.getProfile(token);
        setProfile(data);
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          onLogout();
        } else {
          Alert.alert('Erro', 'Não foi possível carregar os dados de perfil.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  return (
    <Screen>
      <ScreenHeader title="Configurações" />
      <View style={styles.content}>
        {isLoading ? (
          <LoadingState label="Carregando perfil..." />
        ) : (
          <Surface style={styles.card}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={28} color={theme.colors.onPrimary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.usernameText}>{profile?.username || 'Usuário'}</Text>
                <Text style={styles.emailText}>ID da Conta: #{profile?.id || '...'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plataforma</Text>
              <Text style={styles.infoValue}>Navi Mobile</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão do App</Text>
              <Text style={styles.infoValue}>1.0.0 (Beta)</Text>
            </View>
          </Surface>
        )}

        <View style={styles.spacer} />

        <Button variant="danger" onPress={onLogout} style={styles.logoutButton}>
          SAIR DA CONTA
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userInfo: {
    justifyContent: 'center',
  },
  usernameText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.onSurface,
  },
  emailText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.outline,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.outline,
  },
  infoValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
});
