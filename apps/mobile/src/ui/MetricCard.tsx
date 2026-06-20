import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import { Surface } from './Surface';
import { SectionLabel } from './SectionLabel';

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  progress?: number; // Assumed 0 to 100, or 0 to 1
  tone?: 'default' | 'success' | 'warning' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function MetricCard({
  label,
  value,
  detail,
  progress,
  tone = 'default',
  style,
}: MetricCardProps) {
  // Normalize progress to a percentage between 0 and 100
  let normalizedProgress = 0;
  if (progress !== undefined) {
    normalizedProgress = progress <= 1 && progress > 0 ? progress * 100 : progress;
    normalizedProgress = Math.max(0, Math.min(100, normalizedProgress));
  }

  const getToneColor = () => {
    switch (tone) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getToneBg = () => {
    switch (tone) {
      case 'success':
        return theme.colors.successContainer;
      case 'warning':
        return theme.colors.warningContainer;
      case 'danger':
        return theme.colors.errorContainer;
      default:
        return theme.colors.surfaceBright;
    }
  };

  const toneColor = getToneColor();

  return (
    <Surface style={[styles.card, style as any]}>
      <SectionLabel style={styles.label}>{label}</SectionLabel>
      <Text style={styles.value}>{value}</Text>
      
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: getToneBg() }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${normalizedProgress}%`,
                  backgroundColor: toneColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {detail && <Text style={styles.detail}>{detail}</Text>}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },
  label: {
    color: theme.colors.outline,
    marginBottom: theme.spacing.xs,
    fontSize: 10,
  },
  value: {
    fontFamily: theme.fonts.headline,
    fontSize: 24,
    color: theme.colors.onSurface,
  },
  progressContainer: {
    marginTop: theme.spacing.sm,
    height: 4,
    width: '100%',
  },
  progressTrack: {
    height: '100%',
    width: '100%',
    borderRadius: theme.radii.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.radii.xs,
  },
  detail: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.outline,
    marginTop: theme.spacing.sm,
  },
});
