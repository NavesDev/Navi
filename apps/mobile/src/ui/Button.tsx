import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  variant = 'primary',
  disabled = false,
  loading = false,
  onPress,
  children,
  style,
  textStyle,
}: ButtonProps) {
  const isInteractionDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    styles[variant],
    isInteractionDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    isInteractionDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.radii.xs,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  danger: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.error,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderColor: 'transparent',
  },
  text: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.bodySize,
  },
  primaryText: {
    color: theme.colors.onPrimary,
  },
  secondaryText: {
    color: theme.colors.onSurface,
  },
  ghostText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
  dangerText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.outline,
  },
});
