class Expense < ApplicationRecord
  belongs_to :user

  validates :date, :category, :amount, presence: true
  validates :amount, numericality: { greater_than: 0 }
end
