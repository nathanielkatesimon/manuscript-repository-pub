class RemovePasswordResetColumnsFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_index :users, :password_reset_token, if_exists: true
    remove_column :users, :password_reset_token, :string
    remove_column :users, :password_reset_expires_at, :datetime
  end
end
