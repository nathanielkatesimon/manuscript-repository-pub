class CreateDownloadRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :download_requests do |t|
      t.references :student, null: false, foreign_key: { to_table: :users }
      t.references :manuscript, null: false, foreign_key: true
      t.string :status, default: "pending", null: false
      t.text :rejection_reason

      t.timestamps
    end
  end
end
