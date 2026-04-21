class CreateManuscriptAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :manuscript_audit_logs do |t|
      t.references :manuscript, null: false, foreign_key: true
      t.references :editor, null: false, foreign_key: { to_table: :users }
      t.jsonb :field_changes, null: false, default: {}

      t.timestamps
    end
  end
end
