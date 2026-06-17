require "test_helper"

class ExpenseTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
    @category = categories(:one)
  end

  test "should be valid when all parameters are provided correctly" do
    # Arrange
    expense = Expense.new(
      date: "2026-06-16",
      category: @category,
      description: "Supermercado",
      amount: 150.50,
      user: @user
    )

    # Act
    is_valid = expense.valid?

    # Assert
    assert is_valid
  end

  test "should be invalid when date is missing" do
    # Arrange
    expense = Expense.new(
      category: @category,
      amount: 150.50,
      user: @user
    )

    # Act
    is_valid = expense.valid?

    # Assert
    assert_not is_valid
    assert_includes expense.errors[:date], "can't be blank"
  end

  test "should be invalid when category is missing" do
    # Arrange
    expense = Expense.new(
      date: "2026-06-16",
      amount: 150.50,
      user: @user
    )

    # Act
    is_valid = expense.valid?

    # Assert
    assert_not is_valid
    assert_includes expense.errors[:category_id], "can't be blank"
  end

  test "should be invalid when amount is missing" do
    # Arrange
    expense = Expense.new(
      date: "2026-06-16",
      category: @category,
      user: @user
    )

    # Act
    is_valid = expense.valid?

    # Assert
    assert_not is_valid
    assert_includes expense.errors[:amount], "can't be blank"
  end

  test "should be invalid when amount is 0 or negative" do
    # Arrange
    expense_zero = Expense.new(
      date: "2026-06-16",
      category: @category,
      amount: 0,
      user: @user
    )
    expense_negative = Expense.new(
      date: "2026-06-16",
      category: @category,
      amount: -10,
      user: @user
    )

    # Act
    is_valid_zero = expense_zero.valid?
    is_valid_negative = expense_negative.valid?

    # Assert
    assert_not is_valid_zero
    assert_includes expense_zero.errors[:amount], "must be greater than 0"

    assert_not is_valid_negative
    assert_includes expense_negative.errors[:amount], "must be greater than 0"
  end

  test "should be invalid when user is missing" do
    # Arrange
    expense = Expense.new(
      date: "2026-06-16",
      category: @category,
      amount: 150.50
    )

    # Act
    is_valid = expense.valid?

    # Assert
    assert_not is_valid
    assert_includes expense.errors[:user], "must exist"
  end
end
