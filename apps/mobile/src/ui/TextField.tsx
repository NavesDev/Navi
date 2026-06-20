import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../styles/theme';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  editable = true,
  error,
  style,
  inputStyle,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle as any,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.outline}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    backgroundColor: 'transparent',
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  errorText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
