import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface IconButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  size?: number;
}

export function IconButton({
  icon,
  onPress,
  disabled = false,
  style,
  iconColor,
  size = 24,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        style as any,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={icon}
        size={size}
        color={disabled ? theme.colors.outline : (iconColor || theme.colors.primary)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    backgroundColor: theme.colors.surface,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: 'transparent',
  },
});
