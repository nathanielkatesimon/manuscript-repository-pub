class CreateManuscripts < ActiveRecord::Migration[8.1]
  def change
    create_table :manuscripts do |t|
      t.string :title, null: false
      t.text :abstract
      t.string :file_path
      t.date :completion_date
      t.string :program_or_track
      t.string :research_type
      t.text :authors
      t.string :status, null: false, default: "pending"

      t.references :student, null: false, foreign_key: { to_table: :users }
      t.references :adviser, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
