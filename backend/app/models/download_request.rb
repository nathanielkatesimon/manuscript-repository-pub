class DownloadRequest < ApplicationRecord
  belongs_to :student, class_name: "Student", foreign_key: :student_id
  belongs_to :manuscript

  enum :status, { pending: "pending", approved: "approved", rejected: "rejected" }

  validates :status, presence: true
  validates :rejection_reason, presence: true, if: :rejected?
end
