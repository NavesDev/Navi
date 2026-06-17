require "test_helper"

class Api::V1::ExpensesTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
    
    @user_category = categories(:one)
    @other_category = categories(:two)

    @user_expense = expenses(:one) # belongs to user one
    @other_expense = expenses(:two) # belongs to user two
  end

  # --- Index (List) Tests ---

  test "should list all expenses of the authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/expenses", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal @user_category.id, json_response[0]["category_id"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response[0]["user_id"]
  end

  test "should return unauthorized when listing expenses without token" do
    # Arrange & Act
    get "/api/v1/expenses"

    # Assert
    assert_response :unauthorized
  end

  test "should filter listed expenses by category when category filter is provided" do
    # Arrange
    other_cat = Category.create!(name: "Transporte", icon: "directions-car", user: @user)
    Expense.create!(date: "2026-06-17", category: other_cat, amount: 20.0, user: @user)

    # Act
    get "/api/v1/expenses?category_id=#{other_cat.id}", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal other_cat.id, json_response[0]["category_id"]
  end

  test "should filter listed expenses by date range when start and end dates are provided" do
    # Arrange
    other_cat = Category.create!(name: "Transporte", icon: "directions-car", user: @user)
    Expense.create!(date: "2026-06-01", category: other_cat, amount: 20.0, user: @user)
    Expense.create!(date: "2026-06-10", category: @user_category, amount: 30.0, user: @user)
    Expense.create!(date: "2026-06-20", category: other_cat, amount: 40.0, user: @user)

    # Act
    get "/api/v1/expenses?start_date=2026-06-05&end_date=2026-06-15", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    # user_expense is "2026-06-16", and we created one for "2026-06-10"
    assert_equal 1, json_response.size
    assert_equal @user_category.id, json_response[0]["category_id"]
  end

  # --- Show Tests ---

  test "should show expense when it belongs to authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/expenses/#{@user_expense.id}", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal @user_expense.category_id, json_response["category_id"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return not found when showing expense belonging to another user" do
    # Arrange & Act
    get "/api/v1/expenses/#{@other_expense.id}", headers: @headers

    # Assert
    assert_response :not_found
  end

  # --- Create Tests ---

  test "should create expense when parameters are valid and exclude user_id in response" do
    # Arrange
    params = {
      date: "2026-06-17",
      category_id: @user_category.id,
      description: "Cinema com amigos",
      amount: 45.00
    }.to_json

    # Act
    post "/api/v1/expenses", params: params, headers: @headers

    # Assert
    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal @user_category.id, json_response["category_id"]
    assert_equal "45.0", json_response["amount"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return unprocessable entity when creating expense with invalid parameters" do
    # Arrange
    params = {
      date: "",
      category_id: "",
      amount: -10.00
    }.to_json

    # Act
    post "/api/v1/expenses", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /date can't be blank/i, json_response["error"]
    assert_match /category can't be blank/i, json_response["error"]
    assert_match /amount must be greater than 0/i, json_response["error"]
  end

  # --- Update Tests ---

  test "should update expense when it belongs to authenticated user and parameters are valid" do
    # Arrange
    other_cat = Category.create!(name: "Alimentação Saudável", icon: "restaurant", user: @user)
    params = {
      category_id: other_cat.id,
      amount: 120.00
    }.to_json

    # Act
    put "/api/v1/expenses/#{@user_expense.id}", params: params, headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal other_cat.id, json_response["category_id"]
    assert_equal "120.0", json_response["amount"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return not found when updating expense belonging to another user" do
    # Arrange
    params = {
      category_id: @user_category.id
    }.to_json

    # Act
    put "/api/v1/expenses/#{@other_expense.id}", params: params, headers: @headers

    # Assert
    assert_response :not_found
  end

  # --- Destroy Tests ---

  test "should delete expense when it belongs to authenticated user" do
    # Arrange & Act
    delete "/api/v1/expenses/#{@user_expense.id}", headers: @headers

    # Assert
    assert_response :no_content
    assert_nil Expense.find_by(id: @user_expense.id)
  end

  test "should return not found when deleting expense belonging to another user" do
    # Arrange & Act
    delete "/api/v1/expenses/#{@other_expense.id}", headers: @headers

    # Assert
    assert_response :not_found
  end
end
