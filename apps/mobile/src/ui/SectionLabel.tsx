import React from 'react';
import { StyleSheet, Text, StyleProp, TextStyle } from 'react-native';
import { theme } from '../styles/theme';

interface SectionLabelProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.typography.sectionLabelSize,
    color: theme.colors.secondary,
    letterSpacing: theme.typography.labelLetterSpacing,
    textTransform: 'uppercase',
  },
});
