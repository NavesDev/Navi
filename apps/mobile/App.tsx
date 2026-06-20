import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

import { authService } from './src/services/auth';
import { theme } from './src/styles/theme';
import { AuthForm } from './src/components/AuthForm';
import { Chat } from './src/features/chat';
import { Finances } from './src/components/Finances';
import { Routines } from './src/components/Routines';
import { Settings } from './src/components/Settings';
import { BottomTabBar, TabType } from './src/components/BottomTabBar';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Load custom fonts using expo-font
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
        const session = await authService.getSession();
        if (session) {
          setUserToken(session.token);
          setUsername(session.username);
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

  const handleAuthSuccess = (token: string, user: string) => {
    setUserToken(token);
    setUsername(user);
    setActiveTab('chat');
  };

  const handleLogout = async () => {
    await authService.clearSession();
    setUserToken(null);
    setUsername(null);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {userToken && username ? (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabView}>
              <View style={{ flex: 1, display: activeTab === 'chat' ? 'flex' : 'none' }}>
                <Chat token={userToken} />
              </View>
              <View style={{ flex: 1, display: activeTab === 'finances' ? 'flex' : 'none' }}>
                <Finances token={userToken} visible={activeTab === 'finances'} />
              </View>
              <View style={{ flex: 1, display: activeTab === 'routines' ? 'flex' : 'none' }}>
                <Routines token={userToken} />
              </View>
              <View style={{ flex: 1, display: activeTab === 'settings' ? 'flex' : 'none' }}>
                <Settings token={userToken} onLogout={handleLogout} />
              </View>
            </View>
            <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <AuthForm onSuccess={handleAuthSuccess} />
            </ScrollView>
            <StatusBar style="light" />
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabView: {
    flex: 1,
  },
});
