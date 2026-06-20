class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create

  def expired?
    expires_at < Time.current
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(32)
  end
end
