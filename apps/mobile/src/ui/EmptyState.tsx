import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Surface } from './Surface';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  style,
}: EmptyStateProps) {
  return (
    <Surface style={[styles.container, style as any]}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={40}
          color={theme.colors.outline}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children && <View style={styles.actions}>{children}</View>}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    textAlign: 'center',
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.headline,
    fontSize: 18,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    color: theme.colors.outline,
    textAlign: 'center',
    lineHeight: theme.typography.bodyLineHeight,
  },
  actions: {
    marginTop: theme.spacing.lg,
    width: '100%',
  },
});
