class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :type, null: false
      t.string :auth_id, null: false
      t.string :first_name, null: false
      t.string :middle_name
      t.string :last_name, null: false
      t.string :password_digest, null: false
      t.string :role, null: false

      # Student-specific columns
      t.string :program_or_track
      t.string :year_level

      # Adviser-specific columns
      t.string :department

      t.timestamps
    end

    add_index :users, :auth_id, unique: true
  end
end
