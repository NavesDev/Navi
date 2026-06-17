import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { theme } from '../styles/theme';

interface SettingsProps {
  token: string;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ token, onLogout }) => {
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações 🌌</Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.card}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={32} color="#0A0A0A" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.usernameText}>{profile?.username || 'Usuário'}</Text>
                <Text style={styles.emailText}>ID da Conta: #{profile?.id || '...'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plataforma</Text>
              <Text style={styles.infoValue}>Navi Mobile 🌌</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão do App</Text>
              <Text style={styles.infoValue}>1.0.0 (Beta)</Text>
            </View>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 24,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 20,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    color: theme.colors.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  infoValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  logoutButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#4A1D1D',
    backgroundColor: '#1E1010',
    borderRadius: theme.rounded.soft,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    fontFamily: theme.fonts.semibold,
    color: '#FF6B6B',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
