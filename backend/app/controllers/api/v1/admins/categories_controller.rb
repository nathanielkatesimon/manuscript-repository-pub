class Api::V1::Admins::CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_category, only: %i[show update destroy]

  def index
    ordered_categories = Category.order(:title, :id)
    render json: {
      data: ordered_categories.map { |category| Api::V1::CategorySerializer.new(category).as_json }
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::CategorySerializer.new(@category).as_json }, status: :ok
  end

  def create
    category = Category.new(category_params)

    if category.save
      render json: { data: Api::V1::CategorySerializer.new(category).as_json }, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: { data: Api::V1::CategorySerializer.new(@category).as_json }, status: :ok
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @category.destroy
    render json: { message: "Category deleted successfully" }, status: :ok
  end

  private

  def authorize_admin!
    return if current_user.is_a?(Admin)

    render json: { errors: [ "Forbidden" ] }, status: :forbidden
  end

  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: [ "Category not found" ] }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:title, :name)
  end
end
