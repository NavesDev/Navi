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
  visible?: boolean;
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

interface CategoryBudget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  date: string;
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

export const Finances: React.FC<FinancesProps> = ({ token, visible }) => {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, Category>>({});
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category Budget Modal State
  const [isCategoryBudgetModalOpen, setIsCategoryBudgetModalOpen] = useState(false);
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] = useState<Category | null>(null);
  const [selectedCategoryBudget, setSelectedCategoryBudget] = useState<CategoryBudget | null>(null);
  const [categoryBudgetAmount, setCategoryBudgetAmount] = useState('');
  const [isSubmittingCategoryBudget, setIsSubmittingCategoryBudget] = useState(false);
  const [showDeleteCategoryBudgetConfirm, setShowDeleteCategoryBudgetConfirm] = useState(false);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fastfood');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editBudgetAmount, setEditBudgetAmount] = useState('');
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState<number | null>(null);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Create Expense Modal State
  const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<number | null>(null);
  const [isSubmittingNewExpense, setIsSubmittingNewExpense] = useState(false);

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

      // Fetch Category Budgets
      const catBudgetRes = await fetch(`${API_URL}/category_budgets?date=${currentYearMonth}-01`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (catBudgetRes.ok) {
        const catBudgetsData: CategoryBudget[] = await catBudgetRes.json();
        setCategoryBudgets(catBudgetsData);
      }
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible || visible === undefined) {
      fetchData();
    }
  }, [token, visible]);

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
      setIsSubmittingCategory(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense || !editExpenseAmount || !editExpenseDate) {
      Alert.alert('Aviso', 'Preencha o valor e a data.');
      return;
    }

    setIsSubmittingExpense(true);
    try {
      const res = await fetch(`${API_URL}/expenses/${selectedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editExpenseDescription,
          amount: parseFloat(editExpenseAmount.replace(',', '.')),
          category_id: editExpenseCategory,
          date: editExpenseDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao atualizar gasto.');
      }

      setIsExpenseModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar.');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const confirmDeleteExpense = async () => {
    setIsSubmittingExpense(true);
    try {
      const res = await fetch(`${API_URL}/expenses/${selectedExpense?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao excluir gasto.');
      }

      setIsExpenseModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao excluir.');
    } finally {
      setIsSubmittingExpense(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpenseAmount || !newExpenseDate || !newExpenseCategory) {
      Alert.alert('Aviso', 'Preencha o valor, a data e a categoria.');
      return;
    }

    setIsSubmittingNewExpense(true);
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: newExpenseDescription,
          amount: parseFloat(newExpenseAmount.replace(',', '.')),
          category_id: newExpenseCategory,
          date: newExpenseDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar gasto.');
      }

      setIsCreateExpenseModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao criar gasto.');
    } finally {
      setIsSubmittingNewExpense(false);
    }
  };

  // Budget for current month
  const activeBudget = budgets.find(b => b.date.startsWith(currentYearMonth));
  const budgetAmount = activeBudget ? parseFloat(activeBudget.amount) : 0;

  const handleUpdateBudget = async () => {
    if (!editBudgetAmount) {
      Alert.alert('Aviso', 'Preencha o valor do orçamento.');
      return;
    }

    setIsSubmittingBudget(true);
    try {
      const isUpdating = !!activeBudget;
      const url = isUpdating 
        ? `${API_URL}/budgets/${activeBudget.id}`
        : `${API_URL}/budgets`;
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(editBudgetAmount.replace(',', '.')),
          date: isUpdating ? activeBudget.date : `${currentYearMonth}-01`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao salvar orçamento.');
      }

      setIsBudgetModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar orçamento.');
    } finally {
      setIsSubmittingBudget(false);
    }
  };

  const handleSaveCategoryBudget = async () => {
    if (!selectedCategoryForBudget || !categoryBudgetAmount.trim()) {
      Alert.alert('Aviso', 'Preencha o valor da meta.');
      return;
    }

    const parsedAmount = parseFloat(categoryBudgetAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Aviso', 'Por favor, insira um valor maior que 0.');
      return;
    }

    if (budgetAmount <= 0) {
      Alert.alert('Orçamento Ausente', 'Por favor, defina o seu orçamento mensal total antes de configurar metas por categoria.');
      return;
    }

    if (parsedAmount > budgetAmount) {
      Alert.alert('Meta Inválida', `O valor da meta (R$ ${parsedAmount.toFixed(2)}) não pode ser maior do que o orçamento mensal total (R$ ${budgetAmount.toFixed(2)}).`);
      return;
    }

    const otherBudgetsSum = categoryBudgets
      .filter((cb) => cb.category_id !== selectedCategoryForBudget.id)
      .reduce((sum, cb) => sum + parseFloat(cb.amount), 0);

    if (otherBudgetsSum + parsedAmount > budgetAmount) {
      const availableLimit = budgetAmount - otherBudgetsSum;
      Alert.alert(
        'Limite Excedido',
        `A soma das metas das categorias não pode ultrapassar o orçamento mensal total de R$ ${budgetAmount.toFixed(2)}.\n\n` +
        `Soma das outras metas: R$ ${otherBudgetsSum.toFixed(2)}\n` +
        `Limite disponível: R$ ${Math.max(0, availableLimit).toFixed(2)}`
      );
      return;
    }

    setIsSubmittingCategoryBudget(true);
    try {
      const isUpdating = !!selectedCategoryBudget;
      const url = isUpdating
        ? `${API_URL}/category_budgets/${selectedCategoryBudget.id}`
        : `${API_URL}/category_budgets`;
      const method = isUpdating ? 'PUT' : 'POST';

      const body = isUpdating
        ? { category_budget: { amount: parsedAmount } }
        : {
            category_budget: {
              category_id: selectedCategoryForBudget.id,
              amount: parsedAmount,
              date: `${currentYearMonth}-01`,
            },
          };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao salvar a meta da categoria.');
      }

      Alert.alert('Sucesso', 'Meta de categoria salva com sucesso!');
      setIsCategoryBudgetModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar meta de categoria.');
    } finally {
      setIsSubmittingCategoryBudget(false);
    }
  };

  const handleDeleteCategoryBudget = async () => {
    if (!selectedCategoryBudget) return;

    setIsSubmittingCategoryBudget(true);
    try {
      const res = await fetch(`${API_URL}/category_budgets/${selectedCategoryBudget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao excluir a meta da categoria.');
      }

      Alert.alert('Sucesso', 'Meta de categoria removida com sucesso!');
      setIsCategoryBudgetModalOpen(false);
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao excluir meta de categoria.');
    } finally {
      setIsSubmittingCategoryBudget(false);
      setShowDeleteCategoryBudgetConfirm(false);
    }
  };

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
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          
          {/* SECTION 1: Resumo / Saldo */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão Geral (Este Mês)</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.summaryLabel}>ORÇAMENTO</Text>
                  <TouchableOpacity 
                    style={{ marginLeft: 6 }} 
                    onPress={() => {
                      setEditBudgetAmount(budgetAmount > 0 ? budgetAmount.toFixed(2) : '');
                      setIsBudgetModalOpen(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={12} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
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

          {/* SECTION 3: Metas por Categoria */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas por Categoria</Text>
          </View>

          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Crie categorias acima para definir metas.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryBudgetsScrollContent}
            >
              {categories.map((category) => {
                const spent = currentMonthExpenses
                  .filter((e) => e.category_id === category.id)
                  .reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
                const budget = categoryBudgets.find((cb) => cb.category_id === category.id);
                const budgetAmount = budget ? parseFloat(budget.amount) : 0;
                const hasBudget = budgetAmount > 0;
                const percentage = hasBudget ? (spent / budgetAmount) * 100 : 0;

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCategoryForBudget(category);
                      setSelectedCategoryBudget(budget || null);
                      setCategoryBudgetAmount(budget ? parseFloat(budget.amount).toFixed(2) : '');
                      setShowDeleteCategoryBudgetConfirm(false);
                      setIsCategoryBudgetModalOpen(true);
                    }}
                  >
                    <View style={styles.categoryCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        <View style={[styles.iconContainerSmall, { backgroundColor: theme.colors.primaryContainer }]}>
                          <MaterialIcons name={category.icon as any} size={16} color={theme.colors.onPrimaryContainer} />
                        </View>
                        <Text style={styles.categoryCardName} numberOfLines={1}>{category.name}</Text>
                      </View>
                      <Text style={styles.categoryCardBudgetLabel}>
                        {hasBudget ? `Meta: R$ ${budgetAmount.toFixed(2)}` : 'Sem Meta'}
                      </Text>
                    </View>

                    {hasBudget ? (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor:
                                  percentage > 100
                                    ? '#FF6B6B'
                                    : percentage >= 70
                                    ? '#FFA502'
                                    : percentage >= 40
                                    ? '#FFD25A'
                                    : '#6BCB77',
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.progressTextRow}>
                          <Text style={styles.progressSpentText}>Gasto: R$ {spent.toFixed(2)}</Text>
                          <Text style={styles.progressPercentText}>{percentage.toFixed(0)}%</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.setupBudgetHelperText}>Tocar para configurar meta</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* SECTION 4: Histórico de Gastos */}
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
                <TouchableOpacity
                  key={expense.id}
                  style={styles.expenseCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedExpense(expense);
                    setEditExpenseDescription(expense.description || '');
                    setEditExpenseAmount(parseFloat(expense.amount).toFixed(2));
                    setEditExpenseDate(expense.date);
                    setEditExpenseCategory(expense.category_id);
                    setShowDeleteConfirm(false);
                    setIsExpenseModalOpen(true);
                  }}
                >
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
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </>
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

      {/* Expense Modal */}
      <Modal
        visible={isExpenseModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExpenseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Gasto 📝</Text>

            <Text style={styles.inputLabel}>DESCRIÇÃO</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Lanche"
              placeholderTextColor="#555"
              value={editExpenseDescription}
              onChangeText={setEditExpenseDescription}
            />

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>VALOR (R$)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor="#555"
                  value={editExpenseAmount}
                  onChangeText={setEditExpenseAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DATA</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#555"
                  value={editExpenseDate}
                  onChangeText={setEditExpenseDate}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>CATEGORIA</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollModal}
              contentContainerStyle={{ paddingRight: 16, paddingBottom: 24 }}
            >
              {categories.map((category) => {
                const isSelected = editExpenseCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryBadgeModal,
                      isSelected && styles.categoryBadgeModalSelected,
                    ]}
                    onPress={() => setEditExpenseCategory(category.id)}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={16}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.onPrimaryContainer}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryBadgeTextModal,
                        isSelected && { color: theme.colors.onPrimary },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {showDeleteConfirm ? (
              <View style={[styles.modalActions, { justifyContent: 'space-between', backgroundColor: '#2A0808', padding: 8, borderRadius: 8, alignItems: 'center' }]}>
                <Text style={{ color: '#FF6B6B', fontFamily: theme.fonts.medium, fontSize: 12, marginLeft: 8 }}>
                  Excluir mesmo?
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDeleteConfirm(false)}
                    disabled={isSubmittingExpense}
                  >
                    <Text style={styles.cancelButtonText}>NÃO</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: '#FF6B6B' }]}
                    onPress={confirmDeleteExpense}
                    disabled={isSubmittingExpense}
                  >
                    {isSubmittingExpense ? (
                      <ActivityIndicator size="small" color="#0A0A0A" />
                    ) : (
                      <Text style={styles.submitButtonText}>SIM</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.modalActions, { justifyContent: 'space-between' }]}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setShowDeleteConfirm(true)}
                  disabled={isSubmittingExpense}
                >
                  <MaterialIcons name="delete-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsExpenseModalOpen(false)}
                    disabled={isSubmittingExpense}
                  >
                    <Text style={styles.cancelButtonText}>CANCELAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleUpdateExpense}
                    disabled={isSubmittingExpense}
                  >
                    {isSubmittingExpense ? (
                      <ActivityIndicator size="small" color="#0A0A0A" />
                    ) : (
                      <Text style={styles.submitButtonText}>SALVAR</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal
        visible={isBudgetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBudgetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Meu Orçamento 💰</Text>

            <Text style={styles.inputLabel}>QUAL O SEU ORÇAMENTO MENSAL? (R$)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 3500.00"
              placeholderTextColor="#555"
              value={editBudgetAmount}
              onChangeText={setEditBudgetAmount}
              keyboardType="numeric"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsBudgetModalOpen(false)}
                disabled={isSubmittingBudget}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateBudget}
                disabled={isSubmittingBudget}
              >
                {isSubmittingBudget ? (
                  <ActivityIndicator size="small" color="#0A0A0A" />
                ) : (
                  <Text style={styles.submitButtonText}>SALVAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Expense Modal */}
      <Modal
        visible={isCreateExpenseModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateExpenseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo Gasto 💸</Text>

            <Text style={styles.inputLabel}>DESCRIÇÃO</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Lanche no Mac"
              placeholderTextColor="#555"
              value={newExpenseDescription}
              onChangeText={setNewExpenseDescription}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>VALOR (R$)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor="#555"
                  value={newExpenseAmount}
                  onChangeText={setNewExpenseAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DATA</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#555"
                  value={newExpenseDate}
                  onChangeText={setNewExpenseDate}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>CATEGORIA</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollModal}
              contentContainerStyle={{ paddingRight: 16, paddingBottom: 24 }}
            >
              {categories.map((category) => {
                const isSelected = newExpenseCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryBadgeModal,
                      isSelected && styles.categoryBadgeModalSelected,
                    ]}
                    onPress={() => setNewExpenseCategory(category.id)}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={16}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.onPrimaryContainer}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryBadgeTextModal,
                        isSelected && { color: theme.colors.onPrimary },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreateExpenseModalOpen(false)}
                disabled={isSubmittingNewExpense}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateExpense}
                disabled={isSubmittingNewExpense}
              >
                {isSubmittingNewExpense ? (
                  <ActivityIndicator size="small" color="#0A0A0A" />
                ) : (
                  <Text style={styles.submitButtonText}>ADICIONAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Budget Modal */}
      <Modal
        visible={isCategoryBudgetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryBudgetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Meta de Gasto 🌌{'\n'}
              <Text style={{ fontSize: 14, color: theme.colors.secondary, fontFamily: theme.fonts.body }}>
                Categoria: {selectedCategoryForBudget?.name}
              </Text>
            </Text>

            <Text style={styles.inputLabel}>VALOR LIMITE MENSAL (R$)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 500.00"
              placeholderTextColor="#555"
              value={categoryBudgetAmount}
              onChangeText={setCategoryBudgetAmount}
              keyboardType="numeric"
              autoFocus
            />

            {selectedCategoryBudget && showDeleteCategoryBudgetConfirm ? (
              <View style={[styles.modalActions, { justifyContent: 'space-between', backgroundColor: '#2A0808', padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 16 }]}>
                <Text style={{ color: '#FF6B6B', fontFamily: theme.fonts.medium, fontSize: 12, marginLeft: 8 }}>
                  Remover meta mesmo?
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDeleteCategoryBudgetConfirm(false)}
                    disabled={isSubmittingCategoryBudget}
                  >
                    <Text style={styles.cancelButtonText}>NÃO</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: '#FF6B6B' }]}
                    onPress={handleDeleteCategoryBudget}
                    disabled={isSubmittingCategoryBudget}
                  >
                    {isSubmittingCategoryBudget ? (
                      <ActivityIndicator size="small" color="#0A0A0A" />
                    ) : (
                      <Text style={styles.submitButtonText}>SIM</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.modalActions, { justifyContent: selectedCategoryBudget ? 'space-between' : 'flex-end', marginTop: 16 }]}>
                {selectedCategoryBudget && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => setShowDeleteCategoryBudgetConfirm(true)}
                    disabled={isSubmittingCategoryBudget}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsCategoryBudgetModalOpen(false)}
                    disabled={isSubmittingCategoryBudget}
                  >
                    <Text style={styles.cancelButtonText}>CANCELAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSaveCategoryBudget}
                    disabled={isSubmittingCategoryBudget}
                  >
                    {isSubmittingCategoryBudget ? (
                      <ActivityIndicator size="small" color="#0A0A0A" />
                    ) : (
                      <Text style={styles.submitButtonText}>SALVAR</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => {
          setNewExpenseDescription('');
          setNewExpenseAmount('');
          setNewExpenseDate(new Date().toISOString().split('T')[0]);
          setNewExpenseCategory(categories[0]?.id || null);
          setIsCreateExpenseModalOpen(true);
        }}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#0A0A0A" />
      </TouchableOpacity>
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
    paddingBottom: 100,
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
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    color: theme.colors.onSurface,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    paddingHorizontal: 12,
    marginBottom: 20,
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
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScrollModal: {
    maxHeight: 50,
  },
  categoryBadgeModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryBadgeModalSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryBadgeTextModal: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.onPrimaryContainer,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 99,
  },
  categoryCard: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: theme.rounded.soft,
    padding: 16,
    marginRight: 16,
  },
  categoryBudgetsScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryCardName: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  categoryCardBudgetLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#2D2D2D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressSpentText: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.secondary,
  },
  progressPercentText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.secondary,
  },
  setupBudgetHelperText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
