import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { EmptyState } from '../../ui/EmptyState';
import { MaterialIcons } from '@expo/vector-icons';

interface ChatEmptyStateProps {
  onSelectSuggestion: (text: string) => void;
}

const suggestions = [
  'Quanto gastei este mês?',
  'Adicione um gasto de R$ 50 com transporte hoje',
  'Quais categorias estão acima do esperado?',
];

export function ChatEmptyState({ onSelectSuggestion }: ChatEmptyStateProps) {
  return (
    <EmptyState
      icon="assistant"
      title="Como posso ajudar hoje?"
      description="Pergunte sobre seus gastos, adicione novos lançamentos ou consulte a análise do seu orçamento."
    >
      <View style={styles.suggestionsContainer}>
        {suggestions.map((text, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.suggestionButton}
            onPress={() => onSelectSuggestion(text)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{text}</Text>
            <MaterialIcons name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </EmptyState>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    marginBottom: theme.spacing.sm,
  },
  suggestionText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySize,
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
});
