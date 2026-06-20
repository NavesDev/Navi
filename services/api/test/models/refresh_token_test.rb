require "test_helper"

class RefreshTokenTest < ActiveSupport::TestCase
  test "should generate token when creating a new record" do
    # Arrange
    user = users(:one)
    refresh_token = RefreshToken.new(user: user, expires_at: 1.day.from_now)

    # Act
    refresh_token.save!

    # Assert
    assert_not_nil refresh_token.token
    assert_equal 64, refresh_token.token.length # 32 bytes hex = 64 characters
  end

  test "should return true for expired? when expires_at is in the past" do
    # Arrange
    refresh_token = RefreshToken.new(expires_at: 1.day.ago)

    # Act & Assert
    assert_predicate refresh_token, :expired?
  end

  test "should return false for expired? when expires_at is in the future" do
    # Arrange
    refresh_token = RefreshToken.new(expires_at: 1.day.from_now)

    # Act & Assert
    assert_not refresh_token.expired?
  end

  test "should be invalid when expires_at is not present" do
    # Arrange
    user = users(:one)
    refresh_token = RefreshToken.new(user: user, expires_at: nil)

    # Act
    is_valid = refresh_token.valid?

    # Assert
    assert_not is_valid
    assert_includes refresh_token.errors[:expires_at], "can't be blank"
  end

  test "should be invalid when user is not present" do
    # Arrange
    refresh_token = RefreshToken.new(user: nil, expires_at: 1.day.from_now)

    # Act
    is_valid = refresh_token.valid?

    # Assert
    assert_not is_valid
    assert_includes refresh_token.errors[:user], "must exist"
  end
end
