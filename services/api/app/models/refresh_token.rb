require "digest"

class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :generate_token, on: :create

  attr_reader :plaintext_token

  def self.find_by_token(token)
    return nil if token.blank?

    find_by(token: digest_token(token))
  end

  def self.digest_token(token)
    Digest::SHA256.hexdigest(token.to_s)
  end

  def expired?
    expires_at < Time.current
  end

  private

  def generate_token
    return if self[:token].present?

    @plaintext_token = SecureRandom.hex(32)
    self.token = self.class.digest_token(@plaintext_token)
  end
end
