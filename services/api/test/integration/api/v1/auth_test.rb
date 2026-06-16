require "test_helper"

class Api::V1::AuthTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    Rack::Attack.enabled = true
    Rack::Attack.cache.store.clear
  end

  teardown do
    Rack::Attack.enabled = false
  end

  # --- Registration Tests ---

  test "should register a new user when parameters are valid" do
    # Arrange
    params = { username: "new_user", password: "password123" }

    # Act
    post "/api/v1/auth/register", params: params, as: :json

    # Assert
    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "new_user", json_response["user"]["username"]
    assert_not_nil json_response["token"]
  end

  test "should return unprocessable entity when registration parameters are invalid" do
    # Arrange
    params = { username: "jo", password: "password123" }

    # Act
    post "/api/v1/auth/register", params: params, as: :json

    # Assert
    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_match /username is too short/i, json_response["error"]
  end

  # --- Login Tests ---

  test "should return token when login is successful" do
    # Arrange
    params = { username: @user.username, password: "secret123" }

    # Act
    post "/api/v1/auth/login", params: params, as: :json

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal @user.username, json_response["user"]["username"]
    assert_not_nil json_response["token"]
  end

  test "should return unauthorized when password is wrong" do
    # Arrange
    params = { username: @user.username, password: "wrong_password" }

    # Act
    post "/api/v1/auth/login", params: params, as: :json

    # Assert
    assert_response :unauthorized
    json_response = JSON.parse(response.body)
    assert_equal "Invalid username or password", json_response["error"]
  end

  # --- Auth Me Tests ---

  test "should return user profile when request is authenticated" do
    # Arrange
    token = JwtService.encode(user_id: @user.id)
    headers = { "Authorization" => "Bearer #{token}" }

    # Act
    get "/api/v1/auth/me", headers: headers

    # Assert
    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal @user.id, json_response["id"]
    assert_equal @user.username, json_response["username"]
  end

  test "should return unauthorized when requesting profile without token" do
    # Arrange & Act
    get "/api/v1/auth/me"

    # Assert
    assert_response :unauthorized
    json_response = JSON.parse(response.body)
    assert_equal "Unauthorized", json_response["error"]
  end

  # --- Rate Limiting (Rack::Attack) Tests ---

  test "should return 429 when registration/login request rate limit is exceeded" do
    # Arrange
    params = { username: "rate_limited", password: "password123" }
    
    # Act & Assert
    # Perform 5 requests which should not be throttled (first creates user, others return unprocessable due to unique constraint, but not 429)
    5.times do
      post "/api/v1/auth/register", params: params, as: :json
      assert_not_equal 429, response.status
    end

    # 6th request should exceed rate limit and return 429
    post "/api/v1/auth/register", params: params, as: :json
    assert_response :too_many_requests
    json_response = JSON.parse(response.body)
    assert_match /rate limit exceeded/i, json_response["error"]
  end
end
