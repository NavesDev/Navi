import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { API_URL } from '../../services/auth';
import { theme } from '../../styles/theme';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { MetricCard } from '../../ui/MetricCard';
import { EmptyState } from '../../ui/EmptyState';
import { LoadingState } from '../../ui/LoadingState';

interface RoutinesScreenProps {
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

export function RoutinesScreen({ token }: RoutinesScreenProps) {
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
    const targetYearMonth = monthStr.substring(0, 7);
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
    <Screen>
      <ScreenHeader title="Rotinas & Orçamentos" />
      {isLoading ? (
        <LoadingState label="Carregando metas..." />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {budgets.length === 0 ? (
            <EmptyState
              icon="assessment"
              title="Nenhum orçamento"
              description="Você não possui nenhum orçamento configurado no momento."
            />
          ) : (
            budgets.map((budget) => {
              const spent = getExpensesForMonth(budget.date);
              const limit = parseFloat(budget.amount);
              const percentage = Math.min((spent / limit) * 100, 100);
              const isOverLimit = spent > limit;

              return (
                <MetricCard
                  key={budget.id}
                  label={getMonthName(budget.date)}
                  value={`R$ ${spent.toFixed(2)} / R$ ${limit.toFixed(2)}`}
                  detail={isOverLimit ? 'Limite Excedido' : 'Sob Controle'}
                  progress={percentage}
                  tone={isOverLimit ? 'danger' : 'success'}
                  style={styles.metricCard}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  metricCard: {
    marginBottom: theme.spacing.md,
  },
});
