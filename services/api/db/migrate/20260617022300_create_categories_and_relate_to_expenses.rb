class CreateCategoriesAndRelateToExpenses < ActiveRecord::Migration[8.1]
  class MigrationUser < ActiveRecord::Base
    self.table_name = "users"
    has_many :migration_categories, class_name: "CreateCategoriesAndRelateToExpenses::MigrationCategory", foreign_key: "user_id"
    has_many :migration_expenses, class_name: "CreateCategoriesAndRelateToExpenses::MigrationExpense", foreign_key: "user_id"
  end

  class MigrationCategory < ActiveRecord::Base
    self.table_name = "categories"
    belongs_to :migration_user, class_name: "CreateCategoriesAndRelateToExpenses::MigrationUser", foreign_key: "user_id"
  end

  class MigrationExpense < ActiveRecord::Base
    self.table_name = "expenses"
    belongs_to :migration_user, class_name: "CreateCategoriesAndRelateToExpenses::MigrationUser", foreign_key: "user_id"
  end

  def up
    create_table :categories do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :icon, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :categories, [:user_id, :name], unique: true
    add_index :categories, [:user_id, :slug], unique: true

    add_reference :expenses, :category, foreign_key: true, null: true

    # Migrate data
    MigrationExpense.reset_column_information
    MigrationCategory.reset_column_information
    
    MigrationExpense.find_each do |expense|
      # Retrieve category value using read_attribute to avoid missing method errors
      category_name = expense.read_attribute(:category) || "Outros"
      slug = category_name.to_s.downcase.parameterize
      slug = "outros" if slug.blank?

      user = MigrationUser.find(expense.user_id)
      category = user.migration_categories.find_or_create_by!(slug: slug) do |c|
        c.name = category_name
        c.icon = "category"
      end

      expense.update_columns(category_id: category.id)
    end

    remove_column :expenses, :category, :string
    change_column_null :expenses, :category_id, false
  end

  def down
    add_column :expenses, :category, :string
    MigrationExpense.reset_column_information

    MigrationExpense.find_each do |expense|
      if expense.category_id
        category = MigrationCategory.find_by(id: expense.category_id)
        expense.update_columns(category: category&.name || "Outros")
      else
        expense.update_columns(category: "Outros")
      end
    end

    change_column_null :expenses, :category, false
    remove_reference :expenses, :category, foreign_key: true
    drop_table :categories
  end
end
