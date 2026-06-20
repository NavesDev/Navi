import React from 'react';
import { SafeAreaView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: ScreenProps) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
