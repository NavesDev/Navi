import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
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

interface Budget {
  id: number;
  date: string;
  amount: string;
}

const AVAILABLE_ICONS = [
  'fastfood',
  'directions-car',
  'sports-esports',
  'shopping-bag',
  'local-hospital',
  'receipt',
  'flight',
  'school',
  'home',
  'fitness-center',
  'work',
  'star',
];

export const Finances: React.FC<FinancesProps> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, Category>>({});
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fastfood');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch Categories
      const catRes = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const categoriesData: Category[] = await catRes.json();
      setCategories(categoriesData);
      
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

      // Fetch Budgets
      const budgetRes = await fetch(`${API_URL}/budgets`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const budgetsData: Budget[] = await budgetRes.json();
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Aviso', 'Por favor, digite o nome da categoria.');
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: selectedIcon,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar categoria.');
      }

      Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      setNewCategoryName('');
      setSelectedIcon('fastfood');
      setIsModalOpen(false);
      
      // Refresh list
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar a categoria.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Calculations for current month (YYYY-MM)
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"

  // Budget for current month
  const activeBudget = budgets.find(b => b.date.startsWith(currentYearMonth));
  const budgetAmount = activeBudget ? parseFloat(activeBudget.amount) : 0;

  // Expenses for current month
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentYearMonth));
  const totalSpentCurrentMonth = currentMonthExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

  // Balance = Budget - Expenses
  const currentBalance = budgetAmount - totalSpentCurrentMonth;

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
          
          {/* SECTION 1: Resumo / Saldo */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão Geral (Este Mês)</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>ORÇAMENTO</Text>
                <Text style={styles.summaryValue}>R$ {budgetAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>GASTOS</Text>
                <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>- R$ {totalSpentCurrentMonth.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
              <Text style={[styles.balanceValue, currentBalance >= 0 ? styles.balancePositive : styles.balanceNegative]}>
                R$ {currentBalance.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* SECTION 2: Categorias */}
          <View style={styles.sectionHeaderWithAction}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <TouchableOpacity
              style={styles.addCategoryLink}
              onPress={() => setIsModalOpen(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.addCategoryLinkText}>Nova Categoria</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryBadge}>
                <MaterialIcons name={category.icon as any} size={16} color={theme.colors.onPrimaryContainer} style={{ marginRight: 6 }} />
                <Text style={styles.categoryBadgeText}>{category.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* SECTION 3: Histórico de Gastos */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Transações</Text>
          </View>

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

      {/* Add Category Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Categoria 🌌</Text>

            <Text style={styles.inputLabel}>NOME DA CATEGORIA</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Assinaturas, Mercado, etc."
              placeholderTextColor="#555"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <Text style={styles.inputLabel}>SELECIONE UM ÍCONE</Text>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconSelectButton,
                      isSelected && styles.iconSelectButtonSelected,
                    ]}
                    onPress={() => setSelectedIcon(iconName)}
                  >
                    <MaterialIcons
                      name={iconName as any}
                      size={24}
                      color={isSelected ? '#0A0A0A' : theme.colors.secondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalOpen(false)}
                disabled={isSubmittingCategory}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateCategory}
                disabled={isSubmittingCategory}
              >
                {isSubmittingCategory ? (
                  <ActivityIndicator size="small" color="#0A0A0A" />
                ) : (
                  <Text style={styles.submitButtonText}>SALVAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  addCategoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCategoryLinkText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 20,
    marginHorizontal: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 9,
    color: theme.colors.secondary,
    letterSpacing: 1,
  },
  summaryValue: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
  },
  balanceValue: {
    fontFamily: theme.fonts.headline,
    fontSize: 24,
  },
  balancePositive: {
    color: '#6BCB77',
  },
  balanceNegative: {
    color: '#FF6B6B',
  },
  categoriesScroll: {
    marginVertical: 4,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingRight: 32,
    flexDirection: 'row',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.onPrimaryContainer,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 24,
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
    marginHorizontal: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 24,
  },
  modalTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 22,
    color: theme.colors.primary,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    color: theme.colors.onSurface,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconSelectButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconSelectButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.secondary,
    fontSize: 12,
    letterSpacing: 1,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.rounded.soft,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  submitButtonText: {
    fontFamily: theme.fonts.semibold,
    color: '#0A0A0A',
    fontSize: 12,
    letterSpacing: 1,
  },
});
