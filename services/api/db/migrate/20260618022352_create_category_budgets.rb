class CreateCategoryBudgets < ActiveRecord::Migration[8.1]
  def change
    create_table :category_budgets do |t|
      t.references :user, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.date :date, null: false

      t.timestamps
    end

    add_index :category_budgets, [:user_id, :category_id, :date], unique: true, name: 'index_category_budgets_unique'
  end
end
