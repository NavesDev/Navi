class CreateExpenses < ActiveRecord::Migration[8.1]
  def change
    create_table :expenses do |t|
      t.date :date, null: false
      t.string :category, null: false
      t.string :description
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
