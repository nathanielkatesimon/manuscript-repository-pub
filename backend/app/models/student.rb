class Student < User
  has_many :manuscripts, foreign_key: :student_id, dependent: :destroy
  has_many :download_requests, foreign_key: :student_id, dependent: :destroy

  validates :program_or_track, presence: true
  validates :year_level, presence: true
  validates :auth_id, format: { with: /\A(\d{11}|\d{12}|\d{13})\z/, message: "must be 11, 12, or 13 digits" }

  after_initialize :set_role, if: :new_record?

  private

  def set_role
    self.role ||= :student
  end
end
