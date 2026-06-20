import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { API_URL } from '../../services/auth';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Expense {
  id: number;
  date: string;
  category_id: number;
  description: string;
  amount: string;
  created_at: string;
}

export interface Budget {
  id: number;
  date: string;
  amount: string;
}

export interface CategoryBudget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  date: string;
}

export function useFinanceData(token: string, visible?: boolean) {
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
      
      setIsLoading(true);
      await fetchData();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao salvar a categoria.');
    } finally {
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

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentYearMonth));
  const totalSpentCurrentMonth = currentMonthExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
  const currentBalance = budgetAmount - totalSpentCurrentMonth;

  return {
    currentYearMonth,
    expenses,
    categories,
    categoriesMap,
    budgets,
    categoryBudgets,
    isLoading,
    budgetAmount,
    activeBudget,
    currentMonthExpenses,
    totalSpentCurrentMonth,
    currentBalance,

    // Category Budget Modal state and handlers
    isCategoryBudgetModalOpen,
    setIsCategoryBudgetModalOpen,
    selectedCategoryForBudget,
    setSelectedCategoryForBudget,
    selectedCategoryBudget,
    setSelectedCategoryBudget,
    categoryBudgetAmount,
    setCategoryBudgetAmount,
    isSubmittingCategoryBudget,
    showDeleteCategoryBudgetConfirm,
    setShowDeleteCategoryBudgetConfirm,
    handleSaveCategoryBudget,
    handleDeleteCategoryBudget,

    // Category Modal state and handlers
    isModalOpen,
    setIsModalOpen,
    newCategoryName,
    setNewCategoryName,
    selectedIcon,
    setSelectedIcon,
    isSubmittingCategory,
    handleCreateCategory,

    // Budget Modal state and handlers
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    editBudgetAmount,
    setEditBudgetAmount,
    isSubmittingBudget,
    handleUpdateBudget,

    // Expense Modal state and handlers
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    selectedExpense,
    setSelectedExpense,
    editExpenseDescription,
    setEditExpenseDescription,
    editExpenseAmount,
    setEditExpenseAmount,
    editExpenseDate,
    setEditExpenseDate,
    editExpenseCategory,
    setEditExpenseCategory,
    isSubmittingExpense,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleUpdateExpense,
    confirmDeleteExpense,

    // Create Expense Modal state and handlers
    isCreateExpenseModalOpen,
    setIsCreateExpenseModalOpen,
    newExpenseDescription,
    setNewExpenseDescription,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpenseDate,
    setNewExpenseDate,
    newExpenseCategory,
    setNewExpenseCategory,
    isSubmittingNewExpense,
    handleCreateExpense,
    fetchData,
  };
}
