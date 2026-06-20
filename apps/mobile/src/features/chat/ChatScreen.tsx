import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { ChatComposer } from './ChatComposer';
import { ChatThread } from './ChatThread';
import { ChatEmptyState } from './ChatEmptyState';
import { useChatStream } from './useChatStream';
import { IconButton } from '../../ui/IconButton';

interface ChatScreenProps {
  token: string;
  onLogout?: () => void;
}

export function ChatScreen({ token, onLogout }: ChatScreenProps) {
  const { messages, isStreaming, sendMessage, cancelAction } = useChatStream(token);
  const [inputText, setInputText] = useState('');

  const handleSend = (text: string = inputText) => {
    if (text.trim() === '' || isStreaming) return;
    sendMessage(text.trim());
    setInputText('');
  };

  const handleSelectSuggestion = (text: string) => {
    handleSend(text);
  };

  const handleConfirmAction = (messageId: string, originalMessage: string) => {
    sendMessage(originalMessage, true, messageId);
  };

  const handleCancelAction = (messageId: string) => {
    cancelAction(messageId);
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader
        title="Navi"
        subtitle="Inteligência financeira"
        left={
          onLogout ? (
            <IconButton
              icon="logout"
              onPress={onLogout}
              size={20}
              style={styles.logoutButton}
            />
          ) : undefined
        }
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.innerContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <ChatEmptyState onSelectSuggestion={handleSelectSuggestion} />
            </View>
          ) : (
            <ChatThread
              messages={messages}
              onConfirmAction={handleConfirmAction}
              onCancelAction={handleCancelAction}
            />
          )}

          <ChatComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={() => handleSend()}
            isStreaming={isStreaming}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
