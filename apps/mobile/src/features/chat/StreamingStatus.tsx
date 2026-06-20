import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface StreamingStatusProps {
  text: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function StreamingStatus({ text, icon = 'search', style }: StreamingStatusProps) {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons name={icon} size={16} color={theme.colors.primary} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
      <ActivityIndicator size="small" color={theme.colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    color: theme.colors.primary,
    flex: 1,
  },
  spinner: {
    marginLeft: theme.spacing.sm,
  },
});
