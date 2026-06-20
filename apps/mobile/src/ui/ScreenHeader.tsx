import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  logo?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  logo,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style as any]}>
      <View style={styles.leftContainer}>
        {left && <View style={styles.leftSlot}>{left}</View>}
        {logo && <View style={styles.logoSlot}>{logo}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {right && <View style={styles.rightSlot}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftSlot: {
    marginRight: theme.spacing.md,
  },
  logoSlot: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.fonts.headline,
    fontSize: 20,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.outline,
    marginTop: 2,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
});
