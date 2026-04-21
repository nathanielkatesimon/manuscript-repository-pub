class ManuscriptAuditLog < ApplicationRecord
  belongs_to :manuscript
  belongs_to :editor, class_name: "User"

  validates :field_changes, presence: true
end
