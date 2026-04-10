class Feedback < ApplicationRecord
  belongs_to :user
  belongs_to :manuscript

  validates :content, presence: true
end
