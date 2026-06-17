require "test_helper"

class Api::V1::BudgetsTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
    
    @user_budget = budgets(:one) # belongs to user one
    @other_budget = budgets(:two) # belongs to user two
  end

  # --- Index (List) Tests ---

  test "should list all budgets of the authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/budgets", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal "2026-06-01", json_response[0]["date"] # Normalized
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response[0]["user_id"]
  end

  test "should return unauthorized when listing budgets without token" do
    # Arrange & Act
    get "/api/v1/budgets"

    # Assert
    assert_response :unauthorized
  end

  # --- Show Tests ---

  test "should show budget when it belongs to authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/budgets/#{@user_budget.id}", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "2026-06-01", json_response["date"] # Normalized
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return not found when showing budget belonging to another user" do
    # Arrange & Act
    get "/api/v1/budgets/#{@other_budget.id}", headers: @headers

    # Assert
    assert_response :not_found
  end

  # --- Create Tests ---

  test "should create budget when parameters are valid and exclude user_id in response" do
    # Arrange
    params = {
      date: "2026-07-15", # Will normalize to 2026-07-01
      amount: 5500.00
    }.to_json

    # Act
    post "/api/v1/budgets", params: params, headers: @headers

    # Assert
    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "2026-07-01", json_response["date"]
    assert_equal "5500.0", json_response["amount"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return unprocessable entity when creating budget with duplicate month" do
    # Arrange
    # One budget for 2026-06-01 already exists (from @user_budget fixture)
    params = {
      date: "2026-06-20", # Norm to 2026-06-01
      amount: 6000.00
    }.to_json

    # Act
    post "/api/v1/budgets", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /date has already been taken for this user/i, json_response["error"]
  end

  test "should return unprocessable entity when creating budget with invalid parameters" do
    # Arrange
    params = {
      date: "",
      amount: -100.00
    }.to_json

    # Act
    post "/api/v1/budgets", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /date can't be blank/i, json_response["error"]
    assert_match /amount must be greater than 0/i, json_response["error"]
  end

  # --- Update Tests ---

  test "should update budget when it belongs to authenticated user and parameters are valid" do
    # Arrange
    params = {
      amount: 7200.00
    }.to_json

    # Act
    put "/api/v1/budgets/#{@user_budget.id}", params: params, headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "7200.0", json_response["amount"]
    
    # Assert security rule: user_id is NOT leaked
    assert_nil json_response["user_id"]
  end

  test "should return not found when updating budget belonging to another user" do
    # Arrange
    params = {
      amount: 8000.00
    }.to_json

    # Act
    put "/api/v1/budgets/#{@other_budget.id}", params: params, headers: @headers

    # Assert
    assert_response :not_found
  end

  # --- Destroy Tests ---

  test "should delete budget when it belongs to authenticated user" do
    # Arrange & Act
    delete "/api/v1/budgets/#{@user_budget.id}", headers: @headers

    # Assert
    assert_response :no_content
    assert_nil Budget.find_by(id: @user_budget.id)
  end

  test "should return not found when deleting budget belonging to another user" do
    # Arrange & Act
    delete "/api/v1/budgets/#{@other_budget.id}", headers: @headers

    # Assert
    assert_response :not_found
  end
end
