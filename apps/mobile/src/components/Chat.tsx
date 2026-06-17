import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { API_URL } from '../services/auth';

interface ChatProps {
  token: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isSearching?: boolean;
  isCompleted?: boolean;
  icon?: string;
}

export const Chat: React.FC<ChatProps> = ({ token, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when messages list changes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '' || isStreaming) return;

    const userMessageId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: inputText.trim(),
      isCompleted: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    const streamMessageId = `ai_stream_${Date.now()}`;
    // Add an initial empty placeholder for the AI response
    setMessages((prev) => [
      ...prev,
      {
        id: streamMessageId,
        sender: 'ai',
        text: '',
        isSearching: true,
        icon: 'search',
      },
    ]);

    let seenBytes = 0;
    let buffer = '';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/chat`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3 || xhr.readyState === 4) {
        const rawResponse = xhr.responseText;
        const chunk = rawResponse.substring(seenBytes);
        seenBytes = rawResponse.length;

        buffer += chunk;

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const messageBlock = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);

          let eventName = 'message';
          let dataStr = '';

          const lines = messageBlock.split('\n');
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.substring(5).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                updateStreamMessage(streamMessageId, {
                  text: data.error,
                  isSearching: false,
                  isCompleted: true,
                  icon: 'error-outline',
                });
              } else if (data.status === 'searching') {
                const searchIcon = data.placeholder?.icon || 'search';
                const displayText = data.message || data.placeholder?.text || 'Buscando informações...';
                updateStreamMessage(streamMessageId, {
                  text: displayText,
                  isSearching: true,
                  icon: searchIcon,
                });
              } else if (data.status === 'completed') {
                updateStreamMessage(streamMessageId, {
                  text: data.message,
                  isSearching: false,
                  isCompleted: true,
                  icon: undefined,
                });
              }
            } catch (e) {
              console.log('Error parsing stream block:', e);
            }
          }

          boundary = buffer.indexOf('\n\n');
        }
      }

      if (xhr.readyState === 4) {
        setIsStreaming(false);
      }
    };

    xhr.onerror = () => {
      updateStreamMessage(streamMessageId, {
        text: 'Erro de conexão com o servidor.',
        isSearching: false,
        isCompleted: true,
        icon: 'error-outline',
      });
      setIsStreaming(false);
    };

    xhr.send(JSON.stringify({ message: userMsg.text }));
  };

  const updateStreamMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Navi AI 🌌</Text>
          <Text style={styles.headerSubtitle}>Sua inteligência financeira</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={48} color="#333333" />
            <Text style={styles.emptyText}>
              Pergunte algo como:{"\n"}
              "Quanto gastei com Mercado este mês?"{"\n"}
              "Adicione um gasto de R$ 50 hoje com transporte"
            </Text>
          </View>
        )}

        {messages.map((msg) => {
          if (msg.isSearching) {
            // "não use bubbles nas mensagens de busca"
            return (
              <View key={msg.id} style={styles.searchContainer}>
                <View style={styles.searchRow}>
                  <MaterialIcons
                    name={(msg.icon || 'search') as any}
                    size={18}
                    color={theme.colors.primary}
                    style={styles.searchIcon}
                  />
                  <Text style={styles.searchText}>{msg.text}</Text>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={styles.searchLoader}
                  />
                </View>
              </View>
            );
          }

          // User bubbles or final AI bubbles
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.aiRow,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {msg.icon && (
                  <MaterialIcons
                    name={msg.icon as any}
                    size={18}
                    color={isUser ? '#0A0A0A' : theme.colors.onPrimaryContainer}
                    style={{ marginRight: 6, marginBottom: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#8C8C8C"
            value={inputText}
            onChangeText={setInputText}
            editable={!isStreaming}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color="#0A0A0A" />
            ) : (
              <MaterialIcons name="send" size={20} color="#0A0A0A" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 20,
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  aiBubble: {
    backgroundColor: theme.colors.primaryContainer,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: theme.colors.onSurface,
  },
  aiText: {
    color: theme.colors.onPrimaryContainer,
  },
  searchContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  searchLoader: {
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: theme.colors.onSurface,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4A4A4A',
  },
});
