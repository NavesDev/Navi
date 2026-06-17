class User < ApplicationRecord
  has_secure_password
  has_many :expenses, dependent: :destroy
  has_many :budgets, dependent: :destroy
  has_many :categories, dependent: :destroy

  validates :username, presence: true, uniqueness: true, format: { with: /\A[a-zA-Z0-9_]+\z/, message: "only allows letters, numbers, and underscores" }, length: { minimum: 3, maximum: 30 }
end
