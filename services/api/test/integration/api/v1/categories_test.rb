require "test_helper"

class Api::V1::CategoriesTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @other_user = users(:two)
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
    
    @user_category = categories(:one)
    @other_category = categories(:two)
    budgets(:one).update!(amount: 1000.00)
    CategoryBudget.destroy_all
  end

  test "should list all categories of the authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/categories", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.size
    assert_equal @user_category.name, json_response[0]["name"]
    assert_nil json_response[0]["user_id"]
  end

  test "should return unauthorized when listing categories without token" do
    # Arrange & Act
    get "/api/v1/categories"

    # Assert
    assert_response :unauthorized
  end

  test "should create category when parameters are valid and exclude user_id in response" do
    # Arrange
    params = {
      name: "Lazer",
      icon: "movie"
    }.to_json

    # Act
    post "/api/v1/categories", params: params, headers: @headers

    # Assert
    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "Lazer", json_response["name"]
    assert_equal "lazer", json_response["slug"]
    assert_equal "movie", json_response["icon"]
    assert_nil json_response["user_id"]
  end

  test "should return unprocessable entity when creating category with duplicate name for same user" do
    # Arrange
    params = {
      name: @user_category.name,
      icon: "fastfood"
    }.to_json

    # Act
    post "/api/v1/categories", params: params, headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /name has already been taken/i, json_response["error"]
  end

  test "should show category when it belongs to authenticated user and exclude user_id" do
    # Arrange & Act
    get "/api/v1/categories/#{@user_category.id}", headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal @user_category.name, json_response["name"]
    assert_nil json_response["user_id"]
  end

  test "should return not found when showing category belonging to another user" do
    # Arrange & Act
    get "/api/v1/categories/#{@other_category.id}", headers: @headers

    # Assert
    assert_response :not_found
  end

  test "should update category when it belongs to authenticated user and parameters are valid" do
    # Arrange
    params = {
      name: "Alimentação Fina",
      icon: "restaurant"
    }.to_json

    # Act
    put "/api/v1/categories/#{@user_category.id}", params: params, headers: @headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Alimentação Fina", json_response["name"]
    assert_equal "alimentacao-fina", json_response["slug"]
    assert_equal "restaurant", json_response["icon"]
    assert_nil json_response["user_id"]
  end

  test "should return not found when updating category belonging to another user" do
    # Arrange
    params = {
      name: "Novo"
    }.to_json

    # Act
    put "/api/v1/categories/#{@other_category.id}", params: params, headers: @headers

    # Assert
    assert_response :not_found
  end

  test "should delete category when it belongs to authenticated user" do
    # Arrange & Act
    delete "/api/v1/categories/#{@user_category.id}", headers: @headers

    # Assert
    assert_response :no_content
    assert_nil Category.find_by(id: @user_category.id)
  end

  test "should return not found when deleting category belonging to another user" do
    # Arrange & Act
    delete "/api/v1/categories/#{@other_category.id}", headers: @headers

    # Assert
    assert_response :not_found
  end

  test "should return unprocessable entity when deleting category with active budget meta" do
    # Arrange
    CategoryBudget.create!(
      user: @user,
      category: @user_category,
      amount: 150.00,
      date: "2026-06-01"
    )

    # Act
    delete "/api/v1/categories/#{@user_category.id}", headers: @headers

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /Cannot delete record because dependent category budgets exist/i, json_response["error"]
  end
end
