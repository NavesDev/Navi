require "test_helper"

class Api::V1::CategoryBudgetsTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)
    @category = categories(:one) # belongs to user one
    @other_category = categories(:two) # belongs to user two
    
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
    
    # user one has a budget of 9.99 for 2026-06-01 from fixtures. Let's make it 1000.00.
    @budget = budgets(:one)
    @budget.update!(amount: 1000.00)
    
    # Clean up existing category budgets in test db to avoid uniqueness errors
    CategoryBudget.destroy_all
  end

  # --- Index Tests ---

  test "should list all category budgets of the authenticated user" do
    # Arrange
    cb = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 300.00,
      date: "2026-06-01"
    )

    # Act
    get "/api/v1/category_budgets", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal cb.id, json_response[0]["id"]
    assert_equal "300.0", json_response[0]["amount"]
    assert_equal @category.name, json_response[0]["category"]["name"]
  end

  test "should list category budgets filtered by date" do
    # Arrange
    # Create budget for another month
    budget_july = Budget.create!(user: @user, amount: 800.00, date: "2026-07-01")
    
    cb_june = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 300.00,
      date: "2026-06-01"
    )
    cb_july = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 400.00,
      date: "2026-07-01"
    )

    # Act
    get "/api/v1/category_budgets?date=2026-06-18", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal cb_june.id, json_response[0]["id"]
    assert_equal "300.0", json_response[0]["amount"]
  end

  test "should return unauthorized when listing without token" do
    # Arrange & Act
    get "/api/v1/category_budgets"

    # Assert
    assert_response :unauthorized
  end

  # --- Create Tests ---

  test "should create category budget when parameters are valid" do
    # Arrange
    params = {
      category_budget: {
        category_id: @category.id,
        amount: 250.00,
        date: "2026-06-15" # Will normalize to 2026-06-01
      }
    }.to_json

    # Act
    post "/api/v1/category_budgets", params: params, headers: @headers

    # Assert
    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "2026-06-01", json_response["date"]
    assert_equal "250.0", json_response["amount"]
    assert_equal @category.id, json_response["category_id"]
  end

  test "should return unprocessable entity when creating category budget and sum exceeds total budget" do
    # Arrange
    # budget limit is 1000.00
    params = {
      category_budget: {
        category_id: @category.id,
        amount: 1050.00,
        date: "2026-06-01"
      }
    }.to_json

    # Act
    post "/api/v1/category_budgets", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /ultrapassa o limite disponível do orçamento total mensal/i, json_response["error"]
  end

  test "should return unprocessable entity when creating category budget and monthly budget is missing" do
    # Arrange
    # Date with no monthly budget: 2026-08-01
    params = {
      category_budget: {
        category_id: @category.id,
        amount: 200.00,
        date: "2026-08-01"
      }
    }.to_json

    # Act
    post "/api/v1/category_budgets", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /Defina um orçamento mensal total antes de definir metas por categoria/i, json_response["error"]
  end

  test "should reject category budget creation with category belonging to another user" do
    params = {
      category_budget: {
        category_id: @other_category.id,
        amount: 250.00,
        date: "2026-06-15"
      }
    }.to_json

    assert_no_difference -> { @user.category_budgets.count } do
      post "/api/v1/category_budgets", params: params, headers: @headers
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /category/i, json_response["error"]
  end

  # --- Update Tests ---

  test "should update category budget when parameters are valid" do
    # Arrange
    cb = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 300.00,
      date: "2026-06-01"
    )

    params = {
      category_budget: {
        amount: 500.00
      }
    }.to_json

    # Act
    put "/api/v1/category_budgets/#{cb.id}", params: params, headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "500.0", json_response["amount"]
  end

  test "should reject category budget update with category belonging to another user" do
    cb = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 300.00,
      date: "2026-06-01"
    )

    params = {
      category_budget: {
        category_id: @other_category.id
      }
    }.to_json

    put "/api/v1/category_budgets/#{cb.id}", params: params, headers: @headers

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /category/i, json_response["error"]
    assert_equal @category.id, cb.reload.category_id
  end

  # --- Destroy Tests ---

  test "should delete category budget when it belongs to authenticated user" do
    # Arrange
    cb = CategoryBudget.create!(
      user: @user,
      category: @category,
      amount: 300.00,
      date: "2026-06-01"
    )

    # Act
    delete "/api/v1/category_budgets/#{cb.id}", headers: @headers

    # Assert
    assert_response :no_content
    assert_nil CategoryBudget.find_by(id: cb.id)
  end
end
