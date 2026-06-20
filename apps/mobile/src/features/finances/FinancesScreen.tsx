import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Screen } from '../../ui/Screen';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { Surface } from '../../ui/Surface';
import { MetricCard } from '../../ui/MetricCard';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { LoadingState } from '../../ui/LoadingState';
import { EmptyState } from '../../ui/EmptyState';
import { SectionLabel } from '../../ui/SectionLabel';
import { useFinanceData, Category } from './useFinanceData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_WIDTH = SCREEN_WIDTH;

interface FinancesScreenProps {
  token: string;
  visible?: boolean;
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

export function FinancesScreen({ token, visible }: FinancesScreenProps) {
  const finance = useFinanceData(token, visible);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  if (finance.isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Finanças" />
        <LoadingState label="Carregando dados financeiros..." />
      </Screen>
    );
  }

  // Group by page helper
  const size = 4;
  const categoryPages: Category[][] = [];
  for (let i = 0; i < finance.categories.length; i += size) {
    categoryPages.push(finance.categories.slice(i, i + size));
  }

  return (
    <Screen>
      <ScreenHeader
        title="Finanças"
        right={
          <IconButton
            icon="edit"
            onPress={() => {
              finance.setEditBudgetAmount(finance.budgetAmount > 0 ? finance.budgetAmount.toFixed(2) : '');
              finance.setIsBudgetModalOpen(true);
            }}
            size={20}
            style={styles.headerButton}
          />
        }
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SECTION 1: Summary Card */}
        <View style={styles.sectionHeader}>
          <SectionLabel>Visão Geral (Este Mês)</SectionLabel>
        </View>

        <Surface style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ORÇAMENTO</Text>
              <Text style={styles.summaryValue}>R$ {finance.budgetAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>GASTOS</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                - R$ {finance.totalSpentCurrentMonth.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: finance.currentBalance >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              R$ {finance.currentBalance.toFixed(2)}
            </Text>
          </View>
        </Surface>

        {/* SECTION 2: Categories Badge Scroll */}
        <View style={styles.sectionHeaderWithAction}>
          <SectionLabel>Categorias</SectionLabel>
          <TouchableOpacity
            style={styles.addCategoryLink}
            onPress={() => finance.setIsModalOpen(true)}
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
          {finance.categories.map((category) => (
            <View key={category.id} style={styles.categoryBadge}>
              <MaterialIcons
                name={category.icon as any}
                size={14}
                color={theme.colors.onPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.categoryBadgeText}>{category.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* SECTION 3: Metas por Categoria */}
        <View style={styles.sectionHeader}>
          <SectionLabel>Metas por Categoria</SectionLabel>
        </View>

        {finance.categories.length === 0 ? (
          <EmptyState
            icon="category"
            title="Nenhuma Categoria"
            description="Crie categorias para poder definir metas por categoria."
          />
        ) : (
          <View>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryBudgetsScrollContent}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              {categoryPages.map((pageCategories, pageIndex) => (
                <View key={pageIndex} style={[styles.categoryPage, { width: PAGE_WIDTH }]}>
                  {pageCategories.map((category) => {
                    const spent = finance.currentMonthExpenses
                      .filter((e) => e.category_id === category.id)
                      .reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
                    const budget = finance.categoryBudgets.find((cb) => cb.category_id === category.id);
                    const budgetAmount = budget ? parseFloat(budget.amount) : 0;
                    const hasBudget = budgetAmount > 0;
                    const percentage = hasBudget ? (spent / budgetAmount) * 100 : 0;
                    const isOver = spent > budgetAmount;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.categoryCardWrapper}
                        activeOpacity={0.8}
                        onPress={() => {
                          finance.setSelectedCategoryForBudget(category);
                          finance.setSelectedCategoryBudget(budget || null);
                          finance.setCategoryBudgetAmount(budget ? parseFloat(budget.amount).toFixed(2) : '');
                          finance.setShowDeleteCategoryBudgetConfirm(false);
                          finance.setIsCategoryBudgetModalOpen(true);
                        }}
                      >
                        <MetricCard
                          label={category.name}
                          value={`R$ ${spent.toFixed(2)}`}
                          detail={
                            hasBudget
                              ? `Meta: R$ ${budgetAmount.toFixed(2)} (${isOver ? 'Excedido' : 'Sob Controle'})`
                              : 'Toque para configurar meta'
                          }
                          progress={hasBudget ? percentage : undefined}
                          tone={hasBudget ? (isOver ? 'danger' : 'success') : 'default'}
                        />
                      </TouchableOpacity>
                    );
                  })}

                  {Array.from({ length: 4 - pageCategories.length }).map((_, idx) => (
                    <View key={`placeholder-${idx}`} style={styles.placeholderCard} />
                  ))}
                </View>
              ))}
            </Animated.ScrollView>

            {categoryPages.length > 1 && (
              <View style={styles.paginationDotsContainer}>
                {categoryPages.map((_, i) => {
                  const dotWidth = scrollX.interpolate({
                    inputRange: [
                      (i - 1) * PAGE_WIDTH,
                      i * PAGE_WIDTH,
                      (i + 1) * PAGE_WIDTH,
                    ],
                    outputRange: [6, 14, 6],
                    extrapolate: 'clamp',
                  });

                  const dotOpacity = scrollX.interpolate({
                    inputRange: [
                      (i - 1) * PAGE_WIDTH,
                      i * PAGE_WIDTH,
                      (i + 1) * PAGE_WIDTH,
                    ],
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                  });

                  const dotColor = scrollX.interpolate({
                    inputRange: [
                      (i - 1) * PAGE_WIDTH,
                      i * PAGE_WIDTH,
                      (i + 1) * PAGE_WIDTH,
                    ],
                    outputRange: ['#444444', theme.colors.primary, '#444444'],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.paginationDot,
                        {
                          width: dotWidth,
                          opacity: dotOpacity,
                          backgroundColor: dotColor,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* SECTION 4: Transaction History */}
        <View style={styles.sectionHeader}>
          <SectionLabel>Histórico de Transações</SectionLabel>
        </View>

        {finance.expenses.length === 0 ? (
          <EmptyState
            icon="money-off"
            title="Nenhum gasto"
            description="Você ainda não registrou nenhum gasto."
          />
        ) : (
          finance.expenses.map((expense) => {
            const category = finance.categoriesMap[expense.category_id];
            return (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                activeOpacity={0.7}
                onPress={() => {
                  finance.setSelectedExpense(expense);
                  finance.setEditExpenseDescription(expense.description || '');
                  finance.setEditExpenseAmount(parseFloat(expense.amount).toFixed(2));
                  finance.setEditExpenseDate(expense.date);
                  finance.setEditExpenseCategory(expense.category_id);
                  finance.setShowDeleteConfirm(false);
                  finance.setIsExpenseModalOpen(true);
                }}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category ? theme.colors.primaryContainer : theme.colors.surfaceBright },
                  ]}
                >
                  <MaterialIcons
                    name={(category?.icon || 'attach-money') as any}
                    size={20}
                    color={category ? theme.colors.onPrimaryContainer : theme.colors.primary}
                  />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>{expense.description || 'Gasto sem descrição'}</Text>
                  <Text style={styles.expenseMeta}>
                    {category?.name || 'Geral'} • {expense.date}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>- R$ {parseFloat(expense.amount).toFixed(2)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => {
          finance.setNewExpenseDescription('');
          finance.setNewExpenseAmount('');
          finance.setNewExpenseDate(new Date().toISOString().split('T')[0]);
          finance.setNewExpenseCategory(finance.categories[0]?.id || null);
          finance.setIsCreateExpenseModalOpen(true);
        }}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal
        visible={finance.isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finance.setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>

            <TextField
              label="Nome da Categoria"
              placeholder="Ex: Assinaturas, Mercado, etc."
              value={finance.newCategoryName}
              onChangeText={finance.setNewCategoryName}
            />

            <SectionLabel style={styles.modalSubLabel}>Selecione um Ícone</SectionLabel>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = finance.selectedIcon === iconName;
                return (
                  <TouchableOpacity
                    key={iconName}
                    style={[styles.iconSelectButton, isSelected && styles.iconSelectButtonSelected]}
                    onPress={() => finance.setSelectedIcon(iconName)}
                  >
                    <MaterialIcons
                      name={iconName as any}
                      size={20}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.outline}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                onPress={() => finance.setIsModalOpen(false)}
                disabled={finance.isSubmittingCategory}
                style={styles.cancelButton}
              >
                CANCELAR
              </Button>
              <Button
                variant="primary"
                onPress={finance.handleCreateCategory}
                loading={finance.isSubmittingCategory}
                style={styles.submitButton}
              >
                SALVAR
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Edit/Delete Expense Modal */}
      <Modal
        visible={finance.isExpenseModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finance.setIsExpenseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Gasto</Text>

            <TextField
              label="Descrição"
              placeholder="Ex: Lanche"
              value={finance.editExpenseDescription}
              onChangeText={finance.setEditExpenseDescription}
            />

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Valor (R$)"
                  placeholder="0.00"
                  value={finance.editExpenseAmount}
                  onChangeText={finance.setEditExpenseAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <TextField
                  label="Data"
                  placeholder="YYYY-MM-DD"
                  value={finance.editExpenseDate}
                  onChangeText={finance.setEditExpenseDate}
                />
              </View>
            </View>

            <SectionLabel style={styles.modalSubLabel}>Categoria</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollModal}
              contentContainerStyle={{ paddingRight: 16, paddingBottom: 16 }}
            >
              {finance.categories.map((category) => {
                const isSelected = finance.editExpenseCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryBadgeModal, isSelected && styles.categoryBadgeModalSelected]}
                    onPress={() => finance.setEditExpenseCategory(category.id)}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={14}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.categoryBadgeTextModal, isSelected && { color: theme.colors.onPrimary }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {finance.showDeleteConfirm ? (
              <Surface style={styles.confirmDeleteBox}>
                <Text style={styles.confirmDeleteText}>Confirmar exclusão?</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    variant="ghost"
                    onPress={() => finance.setShowDeleteConfirm(false)}
                    disabled={finance.isSubmittingExpense}
                  >
                    NÃO
                  </Button>
                  <Button
                    variant="danger"
                    onPress={finance.confirmDeleteExpense}
                    loading={finance.isSubmittingExpense}
                    style={{ marginLeft: theme.spacing.sm }}
                  >
                    SIM
                  </Button>
                </View>
              </Surface>
            ) : (
              <View style={styles.modalActionsSpaceBetween}>
                <Button
                  variant="danger"
                  onPress={() => finance.setShowDeleteConfirm(true)}
                  disabled={finance.isSubmittingExpense}
                  style={styles.deleteButton}
                >
                  EXCLUIR
                </Button>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    variant="ghost"
                    onPress={() => finance.setIsExpenseModalOpen(false)}
                    disabled={finance.isSubmittingExpense}
                    style={styles.cancelButton}
                  >
                    CANCELAR
                  </Button>
                  <Button
                    variant="primary"
                    onPress={finance.handleUpdateExpense}
                    loading={finance.isSubmittingExpense}
                    style={styles.submitButton}
                  >
                    SALVAR
                  </Button>
                </View>
              </View>
            )}
          </Surface>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={finance.isBudgetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finance.setIsBudgetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Meu Orçamento</Text>

            <TextField
              label="Qual o seu orçamento mensal? (R$)"
              placeholder="Ex: 3500.00"
              value={finance.editBudgetAmount}
              onChangeText={finance.setEditBudgetAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                onPress={() => finance.setIsBudgetModalOpen(false)}
                disabled={finance.isSubmittingBudget}
                style={styles.cancelButton}
              >
                CANCELAR
              </Button>
              <Button
                variant="primary"
                onPress={finance.handleUpdateBudget}
                loading={finance.isSubmittingBudget}
                style={styles.submitButton}
              >
                SALVAR
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Create Expense Modal */}
      <Modal
        visible={finance.isCreateExpenseModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finance.setIsCreateExpenseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo Gasto</Text>

            <TextField
              label="Descrição"
              placeholder="Ex: Almoço"
              value={finance.newExpenseDescription}
              onChangeText={finance.setNewExpenseDescription}
            />

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Valor (R$)"
                  placeholder="0.00"
                  value={finance.newExpenseAmount}
                  onChangeText={finance.setNewExpenseAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <TextField
                  label="Data"
                  placeholder="YYYY-MM-DD"
                  value={finance.newExpenseDate}
                  onChangeText={finance.setNewExpenseDate}
                />
              </View>
            </View>

            <SectionLabel style={styles.modalSubLabel}>Categoria</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollModal}
              contentContainerStyle={{ paddingRight: 16, paddingBottom: 16 }}
            >
              {finance.categories.map((category) => {
                const isSelected = finance.newExpenseCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryBadgeModal, isSelected && styles.categoryBadgeModalSelected]}
                    onPress={() => finance.setNewExpenseCategory(category.id)}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={14}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.categoryBadgeTextModal, isSelected && { color: theme.colors.onPrimary }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                onPress={() => finance.setIsCreateExpenseModalOpen(false)}
                disabled={finance.isSubmittingNewExpense}
                style={styles.cancelButton}
              >
                CANCELAR
              </Button>
              <Button
                variant="primary"
                onPress={finance.handleCreateExpense}
                loading={finance.isSubmittingNewExpense}
                style={styles.submitButton}
              >
                ADICIONAR
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Category Budget Modal */}
      <Modal
        visible={finance.isCategoryBudgetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finance.setIsCategoryBudgetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Meta da Categoria{'\n'}
              <Text style={{ fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.outline }}>
                {finance.selectedCategoryForBudget?.name}
              </Text>
            </Text>

            <TextField
              label="Valor Limite Mensal (R$)"
              placeholder="Ex: 500.00"
              value={finance.categoryBudgetAmount}
              onChangeText={finance.setCategoryBudgetAmount}
              keyboardType="numeric"
            />

            {finance.selectedCategoryBudget && finance.showDeleteCategoryBudgetConfirm ? (
              <Surface style={styles.confirmDeleteBox}>
                <Text style={styles.confirmDeleteText}>Remover meta?</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    variant="ghost"
                    onPress={() => finance.setShowDeleteCategoryBudgetConfirm(false)}
                    disabled={finance.isSubmittingCategoryBudget}
                  >
                    NÃO
                  </Button>
                  <Button
                    variant="danger"
                    onPress={finance.handleDeleteCategoryBudget}
                    loading={finance.isSubmittingCategoryBudget}
                    style={{ marginLeft: theme.spacing.sm }}
                  >
                    SIM
                  </Button>
                </View>
              </Surface>
            ) : (
              <View style={styles.modalActionsSpaceBetween}>
                {finance.selectedCategoryBudget ? (
                  <Button
                    variant="danger"
                    onPress={() => finance.setShowDeleteCategoryBudgetConfirm(true)}
                    disabled={finance.isSubmittingCategoryBudget}
                    style={styles.deleteButton}
                  >
                    REMOVER META
                  </Button>
                ) : (
                  <View />
                )}
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    variant="ghost"
                    onPress={() => finance.setIsCategoryBudgetModalOpen(false)}
                    disabled={finance.isSubmittingCategoryBudget}
                    style={styles.cancelButton}
                  >
                    CANCELAR
                  </Button>
                  <Button
                    variant="primary"
                    onPress={finance.handleSaveCategoryBudget}
                    loading={finance.isSubmittingCategoryBudget}
                    style={styles.submitButton}
                  >
                    SALVAR
                  </Button>
                </View>
              </View>
            )}
          </Surface>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
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
    fontSize: 10,
    color: theme.colors.outline,
    letterSpacing: 1.5,
  },
  summaryValue: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.outline,
    letterSpacing: 1.5,
  },
  balanceValue: {
    fontFamily: theme.fonts.headline,
    fontSize: 22,
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
  categoriesScroll: {
    marginVertical: 4,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingRight: theme.spacing.xl,
    flexDirection: 'row',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    marginRight: theme.spacing.sm,
  },
  categoryBadgeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.onPrimary,
  },
  categoryBudgetsScrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  categoryPage: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryCardWrapper: {
    marginBottom: theme.spacing.sm,
  },
  placeholderCard: {
    height: 96,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radii.xs,
    marginBottom: theme.spacing.sm,
    width: '100%',
    backgroundColor: 'transparent',
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#444444',
    marginHorizontal: 4,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
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
    color: theme.colors.outline,
    marginTop: 2,
  },
  expenseAmount: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.onSurface,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 99,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    padding: theme.spacing.xl,
  },
  modalTitle: {
    fontFamily: theme.fonts.headline,
    fontSize: 22,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  modalSubLabel: {
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  iconSelectButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconSelectButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  modalActionsSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    marginRight: theme.spacing.xs,
  },
  submitButton: {
    minWidth: 100,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  rowFields: {
    flexDirection: 'row',
  },
  categoriesScrollModal: {
    maxHeight: 50,
  },
  categoryBadgeModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryBadgeModalSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryBadgeTextModal: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  confirmDeleteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.error,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radii.xs,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  confirmDeleteText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
  },
});
