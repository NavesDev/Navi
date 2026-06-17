class CreateBudgets < ActiveRecord::Migration[8.1]
  def change
    create_table :budgets do |t|
      t.date :date, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_index :budgets, [:user_id, :date], unique: true
  end
end
