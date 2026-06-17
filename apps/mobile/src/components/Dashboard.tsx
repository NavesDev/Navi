import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { authService } from '../services/auth';
import { theme, globalStyles } from '../styles/theme';

interface DashboardProps {
  token: string;
  username: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ token, username, onLogout }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleCheckProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = await authService.getProfile(token);
      setProfileData(data);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        Alert.alert('Não Autorizado', 'Sua sessão expirou ou é inválida.');
        onLogout();
      } else {
        Alert.alert('Erro de Conexão', 'Não foi possível buscar dados do perfil.');
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.headline}>Navi 🌌</Text>
      <Text style={styles.welcomeText}>Bem-vindo, {username}!</Text>
      
      <View style={globalStyles.divider} />
      
      <Text style={styles.label}>Sessão Ativa</Text>
      <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="tail">
        {token}
      </Text>

      {profileData && (
        <View style={styles.profileContainer}>
          <Text style={styles.label}>Resposta de /auth/me:</Text>
          <Text style={styles.profileDataText}>
            Usuário: {profileData.username}
          </Text>
        </View>
      )}

      <View style={styles.buttonSpacing} />

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleCheckProfile}
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
        onPress={onLogout}
      >
        <Text style={styles.secondaryButtonText}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontFamily: theme.fonts.body,
    fontSize: 18,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
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
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 4,
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
  buttonSpacing: {
    height: 8,
  },
});
