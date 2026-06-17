class Budget < ApplicationRecord
  belongs_to :user

  before_validation :normalize_date

  validates :date, :amount, presence: true
  validates :amount, numericality: { greater_than: 0 }
  validates :date, uniqueness: { scope: :user_id, message: "has already been taken for this user" }

  private

  def normalize_date
    self.date = date.beginning_of_month if date.present?
  end
end
