require "digest"

class DigestExistingRefreshTokens < ActiveRecord::Migration[8.1]
  def up
    select_all("SELECT id, token FROM refresh_tokens WHERE token IS NOT NULL").each do |row|
      digest = Digest::SHA256.hexdigest(row["token"].to_s)
      update "UPDATE refresh_tokens SET token = #{quote(digest)} WHERE id = #{quote(row["id"])}"
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
