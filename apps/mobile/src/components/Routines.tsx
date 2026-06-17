import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../services/auth';
import { theme } from '../styles/theme';

interface RoutinesProps {
  token: string;
}

interface Budget {
  id: number;
  date: string;
  amount: string;
}

interface Expense {
  id: number;
  date: string;
  amount: string;
}

export const Routines: React.FC<RoutinesProps> = ({ token }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const budgetRes = await fetch(`${API_URL}/budgets`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const budgetsData = await budgetRes.json();

        const expenseRes = await fetch(`${API_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const expensesData = await expenseRes.json();

        setBudgets(budgetsData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Failed to fetch budgets data:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados de rotinas/orçamentos.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // Group expenses by month (YYYY-MM)
  const getExpensesForMonth = (monthStr: string) => {
    // monthStr is YYYY-MM-DD (first day of the month usually, e.g. 2026-06-01)
    const targetYearMonth = monthStr.substring(0, 7); // "2026-06"
    return expenses
      .filter(e => e.date.startsWith(targetYearMonth))
      .reduce((sum, curr) => sum + parseFloat(curr.amount || '0'), 0);
  };

  const getMonthName = (dateStr: string) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotinas & Orçamentos 🌌</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Metas Mensais</Text>

          {budgets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="assessment" size={40} color="#555555" />
              <Text style={styles.emptyText}>Nenhum orçamento configurado.</Text>
            </View>
          ) : (
            budgets.map((budget) => {
              const spent = getExpensesForMonth(budget.date);
              const limit = parseFloat(budget.amount);
              const percentage = Math.min((spent / limit) * 100, 100);
              const isOverLimit = spent > limit;

              return (
                <View key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetMonth}>{getMonthName(budget.date)}</Text>
                    <Text style={[styles.budgetStatus, isOverLimit && styles.statusOverLimit]}>
                      {isOverLimit ? 'Limite Excedido' : 'Sob Controle'}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percentage}%` },
                          isOverLimit ? { backgroundColor: '#FF6B6B' } : { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    </View>
                    <View style={styles.budgetDetails}>
                      <Text style={styles.detailsText}>
                        R$ {spent.toFixed(2)} de R$ {limit.toFixed(2)}
                      </Text>
                      <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 22,
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loader: {
    marginTop: 40,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: 12,
  },
  budgetCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 20,
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetMonth: {
    fontFamily: theme.fonts.semibold,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  budgetStatus: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: '#6BCB77',
    backgroundColor: '#152C1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusOverLimit: {
    color: '#FF6B6B',
    backgroundColor: '#351616',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.secondary,
  },
  percentageText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.onSurface,
  },
});
