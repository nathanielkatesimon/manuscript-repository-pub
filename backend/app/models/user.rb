class User < ApplicationRecord
  has_secure_password reset_token: { expires_in: 2.hours }

  enum :role, { student: "student", adviser: "adviser", admin: "admin" }
  
  has_one_attached :avatar

  has_many :feedbacks

  before_save :normalize_email

  validates :auth_id, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email address" }

  private

  def normalize_email
    self.email = email.downcase.strip if email.present?
  end
end
