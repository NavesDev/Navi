require "test_helper"

class CategoryBudgetTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
    @category = categories(:one)
    # user :one has a budget of 9.99 for 2026-06-01. Let's make sure it's 1000.00 for tests to make it easy.
    @budget = budgets(:one)
    @budget.update!(amount: 1000.00)
    CategoryBudget.destroy_all
  end

  test "should be valid when all parameters are provided correctly" do
    # Arrange
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 100.00,
      date: "2026-06-15"
    )

    # Act
    is_valid = category_budget.valid?

    # Assert
    assert is_valid
  end

  test "should normalize date to beginning of month when date is provided" do
    # Arrange
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 100.00,
      date: "2026-06-15"
    )

    # Act
    category_budget.valid?

    # Assert
    assert_equal Date.parse("2026-06-01"), category_budget.date
  end

  test "should be invalid when date is missing" do
    # Arrange
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 100.00,
      date: nil
    )

    # Act
    is_valid = category_budget.valid?

    # Assert
    assert_not is_valid
    assert_includes category_budget.errors[:date], "can't be blank"
  end

  test "should be invalid when amount is missing" do
    # Arrange
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: nil,
      date: "2026-06-01"
    )

    # Act
    is_valid = category_budget.valid?

    # Assert
    assert_not is_valid
    assert_includes category_budget.errors[:amount], "can't be blank"
  end

  test "should be invalid when amount is 0 or negative" do
    # Arrange
    cb_zero = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 0,
      date: "2026-06-01"
    )
    cb_negative = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: -50.00,
      date: "2026-06-01"
    )

    # Act
    is_valid_zero = cb_zero.valid?
    is_valid_negative = cb_negative.valid?

    # Assert
    assert_not is_valid_zero
    assert_includes cb_zero.errors[:amount], "must be greater than 0"
    assert_not is_valid_negative
    assert_includes cb_negative.errors[:amount], "must be greater than 0"
  end

  test "should enforce unique category budget per month per user when creating a duplicate" do
    # Arrange
    CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 100.00,
      date: "2026-06-01"
    )

    duplicate = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 200.00,
      date: "2026-06-15" # Normalize to 2026-06-01
    )

    # Act
    is_valid = duplicate.valid?

    # Assert
    assert_not is_valid
    assert_includes duplicate.errors[:category_id], "já possui uma meta definida para este mês"
  end

  test "should prevent category budget when total monthly budget is not defined" do
    # Arrange
    # A month where user doesn't have a budget (e.g. 2026-08-01)
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 100.00,
      date: "2026-08-01"
    )

    # Act
    is_valid = category_budget.valid?

    # Assert
    assert_not is_valid
    assert_includes category_budget.errors[:base], "Defina um orçamento mensal total antes de definir metas por categoria."
  end

  test "should prevent category budget when sum of category budgets exceeds total monthly budget" do
    # Arrange
    # @budget amount is 1000.00. Let's create category budget with 1001.00
    category_budget = CategoryBudget.new(
      user: @user,
      category: @category,
      amount: 1001.00,
      date: "2026-06-01"
    )

    # Act
    is_valid = category_budget.valid?

    # Assert
    assert_not is_valid
    assert_includes category_budget.errors[:amount], "ultrapassa o limite disponível do orçamento total mensal (R$ 1000.0 restantes)."
  end

  test "should prevent category deletion when category budget exists" do
    # Arrange
    CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 200.00,
      date: "2026-06-01"
    )

    # Act
    destroyed = @category.destroy

    # Assert
    assert_not destroyed
    assert_includes @category.errors[:base], "Cannot delete record because dependent category budgets exist"
  end
end
