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

interface FinancesProps {
  token: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Expense {
  id: number;
  date: string;
  category_id: number;
  description: string;
  amount: string;
  created_at: string;
}

export const Finances: React.FC<FinancesProps> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, Category>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Categories
        const catRes = await fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const categoriesData: Category[] = await catRes.json();
        const catMap: Record<number, Category> = {};
        categoriesData.forEach(c => {
          catMap[c.id] = c;
        });
        setCategoriesMap(catMap);

        // Fetch Expenses
        const expRes = await fetch(`${API_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const expensesData: Expense[] = await expRes.json();
        setExpenses(expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const totalSpent = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finanças 🌌</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL GASTO REGISTRADO</Text>
            <Text style={styles.summaryValue}>R$ {totalSpent.toFixed(2)}</Text>
            <View style={styles.summaryFooter}>
              <MaterialIcons name="trending-up" size={16} color={theme.colors.primary} />
              <Text style={styles.summaryFooterText}>{expenses.length} transações registradas</Text>
            </View>
          </View>

          {/* Transactions List */}
          <Text style={styles.sectionTitle}>Histórico de Gastos</Text>

          {expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="money-off" size={40} color="#555555" />
              <Text style={styles.emptyText}>Nenhum gasto registrado ainda.</Text>
            </View>
          ) : (
            expenses.map((expense) => {
              const category = categoriesMap[expense.category_id];
              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={[styles.iconContainer, { backgroundColor: category ? theme.colors.primaryContainer : '#2A2A2A' }]}>
                    <MaterialIcons
                      name={(category?.icon || 'attach-money') as any}
                      size={20}
                      color={category ? theme.colors.onPrimaryContainer : '#FFFFFF'}
                    />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>{expense.description || 'Gasto sem descrição'}</Text>
                    <Text style={styles.expenseMeta}>
                      {category?.name || 'Geral'} • {expense.date}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    - R$ {parseFloat(expense.amount).toFixed(2)}
                  </Text>
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
    fontSize: 24,
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 20,
    marginBottom: 24,
  },
  summaryLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontFamily: theme.fonts.headline,
    fontSize: 36,
    color: theme.colors.primary,
    marginVertical: 8,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryFooterText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.secondary,
    marginLeft: 6,
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
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  expenseMeta: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  expenseAmount: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.primary,
  },
});
