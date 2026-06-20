import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ChatMessageBlock } from './ChatMessageBlock';
import { Message } from './useChatStream';
import { theme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ChatThreadProps {
  messages: Message[];
}

export function ChatThread({ messages }: ChatThreadProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, messages[messages.length - 1]?.text]);

  const getMessageLabel = (message: Message) => {
    if (message.isSearching) return 'BUSCA';
    if (message.sender === 'user') return 'VOCÊ';
    return 'ANÁLISE';
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) => (
        <ChatMessageBlock
          key={msg.id}
          text={msg.text}
          sender={msg.sender}
          label={getMessageLabel(msg)}
          icon={(msg.icon || (msg.sender === 'ai' ? 'assistant' : undefined)) as keyof typeof MaterialIcons.glyphMap}
          isSearching={msg.isSearching}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
