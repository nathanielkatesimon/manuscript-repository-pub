class Adviser < User
  has_many :manuscripts, foreign_key: :adviser_id, dependent: :nullify

  validates :department, presence: true
  validates :auth_id, format: { with: /\A\d{2}-\d{4}-\d{3}\z/, message: "must match format XX-XXXX-XXX" }

  after_initialize :set_role, if: :new_record?

  private

  def set_role
    self.role ||= :adviser
  end
end
