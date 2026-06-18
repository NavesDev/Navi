class CategoryBudget < ApplicationRecord
  belongs_to :user
  belongs_to :category

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :category_id, presence: true

  # Garante que a data seja sempre salva como o primeiro dia do mês
  before_validation :normalize_date_to_beginning_of_month

  # Garante a unicidade de categoria por mês para o mesmo usuário
  validates :category_id, uniqueness: { 
    scope: [:user_id, :date], 
    message: "já possui uma meta definida para este mês" 
  }

  validate :sum_within_total_monthly_budget

  private

  def normalize_date_to_beginning_of_month
    self.date = date.beginning_of_month if date.present?
  end

  def sum_within_total_monthly_budget
    return unless user && date && amount

    monthly_budget = user.budgets.find_by(date: date.beginning_of_month)
    if monthly_budget.nil?
      errors.add(:base, "Defina um orçamento mensal total antes de definir metas por categoria.")
      return
    end

    # Soma de todas as metas de categoria cadastradas no mês (exceto a atual se for update)
    existing_sum = user.category_budgets
                       .where(date: date.beginning_of_month)
                       .where.not(id: id)
                       .sum(:amount)

    if (existing_sum + amount) > monthly_budget.amount
      errors.add(:amount, "ultrapassa o limite disponível do orçamento total mensal (R$ #{monthly_budget.amount - existing_sum} restantes).")
    end
  end
end
