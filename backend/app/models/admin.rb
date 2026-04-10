class Admin < User
  validates :auth_id, format: { with: /\A[a-zA-Z0-9]{1,16}\z/, message: "must be alphanumeric with max 16 characters" }

  after_initialize :set_role, if: :new_record?

  private

  def set_role
    self.role ||= :admin
  end
end
