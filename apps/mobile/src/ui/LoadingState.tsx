import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface LoadingStateProps {
  label?: string;
  style?: ViewStyle;
}

export function LoadingState({ label, style }: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    color: theme.colors.outline,
    marginTop: theme.spacing.md,
  },
});
