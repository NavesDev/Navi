require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "should create a user when valid parameters are provided" do
    # Arrange
    user = User.new(username: "john_doe", password: "password123")

    # Act
    saved = user.save

    # Assert
    assert saved
    assert_not_nil user.password_digest
  end

  test "should not create a user when username is missing" do
    # Arrange
    user = User.new(password: "password123")

    # Act
    saved = user.save

    # Assert
    assert_not saved
    assert_includes user.errors[:username], "can't be blank"
  end

  test "should not create a user when username is already taken" do
    # Arrange
    User.create!(username: "john_doe", password: "password123")
    duplicate_user = User.new(username: "john_doe", password: "password456")

    # Act
    saved = duplicate_user.save

    # Assert
    assert_not saved
    assert_includes duplicate_user.errors[:username], "has already been taken"
  end

  test "should not create a user when username has invalid characters" do
    # Arrange
    user = User.new(username: "john-doe!", password: "password123")

    # Act
    saved = user.save

    # Assert
    assert_not saved
    assert_includes user.errors[:username], "only allows letters, numbers, and underscores"
  end

  test "should not create a user when username is too short" do
    # Arrange
    user = User.new(username: "jo", password: "password123")

    # Act
    saved = user.save

    # Assert
    assert_not saved
    assert_includes user.errors[:username], "is too short (minimum is 3 characters)"
  end
end
