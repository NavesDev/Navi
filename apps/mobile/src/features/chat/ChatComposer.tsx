import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../styles/theme';
import { IconButton } from '../../ui/IconButton';

interface ChatComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  isStreaming,
}: ChatComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isSendDisabled = !value.trim() || isStreaming;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Envie uma mensagem..."
          placeholderTextColor={theme.colors.outline}
          multiline
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <View style={styles.actionWrapper}>
        {isStreaming ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <IconButton
            icon="send"
            onPress={onSend}
            disabled={isSendDisabled}
            style={styles.sendButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    backgroundColor: theme.colors.surfaceContainerLowest,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
  },
  input: {
    color: theme.colors.onSurface,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    padding: 0,
    textAlignVertical: 'center',
  },
  actionWrapper: {
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  loader: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
