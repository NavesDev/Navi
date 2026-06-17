import React, { useState, useRef, useEffect } from 'react';
import {
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
import { chatStyles as styles } from '../styles/chatStyles';
import { useChatStream } from '../hooks/useChatStream';

interface ChatProps {
  token: string;
  onBack: () => void;
}

export const Chat: React.FC<ChatProps> = ({ token, onBack }) => {
  const { messages, isStreaming, sendMessage } = useChatStream(token);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '' || isStreaming) return;
    sendMessage(inputText.trim());
    setInputText('');
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
