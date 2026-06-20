import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface SurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export function Surface({ children, style, elevated = false }: SurfaceProps) {
  return <View style={[styles.surface, elevated && styles.elevated, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    padding: theme.spacing.lg,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceContainer,
  },
});
