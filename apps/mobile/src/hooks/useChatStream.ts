import { useState } from 'react';
import { API_URL } from '../services/auth';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isSearching?: boolean;
  isCompleted?: boolean;
  icon?: string;
}

export function useChatStream(token: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = (text: string) => {
    if (text.trim() === '' || isStreaming) return;

    const userMessageId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: text.trim(),
      isCompleted: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const streamMessageId = `ai_stream_${Date.now()}`;
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

    const updateStreamMessage = (id: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
      );
    };

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

  return {
    messages,
    isStreaming,
    sendMessage,
  };
}
