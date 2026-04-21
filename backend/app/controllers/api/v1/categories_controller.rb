class Api::V1::CategoriesController < ApplicationController
  before_action :authenticate_user!

  def index
    ordered_categories = Category.order(:title, :id)
    render json: {
      data: ordered_categories.map { |category| Api::V1::CategorySerializer.new(category).as_json }
    }, status: :ok
  end
end
