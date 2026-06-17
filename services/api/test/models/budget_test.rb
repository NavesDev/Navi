require "test_helper"

class BudgetTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test "should be valid when all parameters are provided correctly" do
    # Arrange
    budget = Budget.new(
      date: "2026-07-01",
      amount: 5000.00,
      user: @user
    )

    # Act
    is_valid = budget.valid?

    # Assert
    assert is_valid
  end

  test "should normalize date to beginning of month when date is provided" do
    # Arrange
    budget = Budget.new(
      date: "2026-07-15", # Mid of month
      amount: 5000.00,
      user: @user
    )

    # Act
    budget.valid? # Triggers validations and normalize_date callback

    # Assert
    assert_equal Date.parse("2026-07-01"), budget.date
  end

  test "should be invalid when date is missing" do
    # Arrange
    budget = Budget.new(
      amount: 5000.00,
      user: @user
    )

    # Act
    is_valid = budget.valid?

    # Assert
    assert_not is_valid
    assert_includes budget.errors[:date], "can't be blank"
  end

  test "should be invalid when amount is missing" do
    # Arrange
    budget = Budget.new(
      date: "2026-06-01",
      user: @user
    )

    # Act
    is_valid = budget.valid?

    # Assert
    assert_not is_valid
    assert_includes budget.errors[:amount], "can't be blank"
  end

  test "should be invalid when amount is 0 or negative" do
    # Arrange
    budget_zero = Budget.new(
      date: "2026-06-01",
      amount: 0,
      user: @user
    )
    budget_negative = Budget.new(
      date: "2026-06-01",
      amount: -100,
      user: @user
    )

    # Act
    is_valid_zero = budget_zero.valid?
    is_valid_negative = budget_negative.valid?

    # Assert
    assert_not is_valid_zero
    assert_includes budget_zero.errors[:amount], "must be greater than 0"

    assert_not is_valid_negative
    assert_includes budget_negative.errors[:amount], "must be greater than 0"
  end

  test "should enforce unique budget per month per user when creating a duplicate" do
    # Arrange
    # Create first budget
    Budget.create!(
      date: "2026-07-01",
      amount: 5000.00,
      user: @user
    )
    
    # Try to create second budget for same month and same user
    duplicate_budget = Budget.new(
      date: "2026-07-15", # Will normalize to 2026-07-01
      amount: 6000.00,
      user: @user
    )

    # Act
    is_valid = duplicate_budget.valid?

    # Assert
    assert_not is_valid
    assert_includes duplicate_budget.errors[:date], "has already been taken for this user"
  end

  test "should allow different users to have budgets for the same month" do
    # Arrange
    other_user = users(:two)
    Budget.create!(
      date: "2026-07-01",
      amount: 5000.00,
      user: @user
    )
    
    other_user_budget = Budget.new(
      date: "2026-07-01",
      amount: 6000.00,
      user: other_user
    )

    # Act
    is_valid = other_user_budget.valid?

    # Assert
    assert is_valid
  end
end
