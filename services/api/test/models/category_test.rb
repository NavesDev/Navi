require "test_helper"

class CategoryTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test "should generate slug automatically when created without one" do
    # Arrange
    category = Category.new(name: "Lazer e Cinema", icon: "movie", user: @user)

    # Act
    category.save!

    # Assert
    assert_equal "lazer-e-cinema", category.slug
  end

  test "should fail validation when name is missing" do
    # Arrange
    category = Category.new(icon: "movie", user: @user)

    # Act
    result = category.valid?

    # Assert
    assert_not result
    assert_includes category.errors[:name], "can't be blank"
  end

  test "should fail validation when slug is already taken by the same user" do
    # Arrange
    Category.create!(name: "Lazer", slug: "lazer", icon: "movie", user: @user)
    duplicate_category = Category.new(name: "Outro Lazer", slug: "lazer", icon: "movie", user: @user)

    # Act
    result = duplicate_category.valid?

    # Assert
    assert_not result
    assert_includes duplicate_category.errors[:slug], "has already been taken"
  end
end
