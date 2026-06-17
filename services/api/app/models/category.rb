class Category < ApplicationRecord
  belongs_to :user
  has_many :expenses, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :user_id }
  validates :slug, presence: true, uniqueness: { scope: :user_id }
  validates :icon, presence: true

  before_validation :generate_slug

  private

  def generate_slug
    if slug.blank? || (name_changed? && slug == name_was.to_s.downcase.parameterize)
      self.slug = name.to_s.downcase.parameterize if name.present?
    end
  end
end
