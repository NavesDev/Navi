import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Surface } from '../../ui/Surface';
import { SectionLabel } from '../../ui/SectionLabel';
import { StreamingStatus } from './StreamingStatus';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

export interface ChatMessageBlockProps {
  text: string;
  sender: 'user' | 'ai';
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  isSearching?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ChatMessageBlock({
  text,
  sender,
  label,
  icon,
  isSearching = false,
  style,
}: ChatMessageBlockProps) {
  if (sender === 'user') {
    return (
      <View style={[styles.userContainer, style]}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{text}</Text>
        </View>
      </View>
    );
  }

  // AI Block
  return (
    <Surface style={[styles.aiSurface, style]}>
      <View style={styles.aiHeader}>
        {icon && !isSearching && (
          <MaterialIcons
            name={icon}
            size={16}
            color={theme.colors.secondary}
            style={styles.headerIcon}
          />
        )}
        <SectionLabel>{label || (isSearching ? 'BUSCA' : 'ANALISE')}</SectionLabel>
      </View>
      
      {isSearching ? (
        <StreamingStatus text={text} icon={icon} />
      ) : (
        <MarkdownRenderer text={text} isUser={false} />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginVertical: theme.spacing.sm,
  },
  userBubble: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    maxWidth: '85%',
  },
  userText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    color: theme.colors.onSurface,
    lineHeight: theme.typography.bodyLineHeight,
  },
  aiSurface: {
    width: '100%',
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
});
