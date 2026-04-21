class Category < ApplicationRecord
  validates :title, presence: true
  validates :name, presence: true, uniqueness: true
end
