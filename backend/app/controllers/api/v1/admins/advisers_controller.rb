class Api::V1::Admins::AdvisersController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_adviser, only: %i[update destroy]

  def create
    adviser = Adviser.new(create_params)

    if adviser.save
      render json: { data: Api::V1::AdviserSerializer.new(adviser).as_json }, status: :created
    else
      render json: { errors: adviser.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @adviser.update(update_params)
      render json: { data: Api::V1::AdviserSerializer.new(@adviser).as_json }, status: :ok
    else
      render json: { errors: @adviser.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @adviser.destroy
    render json: { message: "Adviser deleted successfully" }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end

  def set_adviser
    @adviser = Adviser.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Adviser not found"] }, status: :not_found
  end

  def create_params
    params.require(:adviser).permit(
      :auth_id, :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation, :department
    )
  end

  def update_params
    params.require(:adviser).permit(
      :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation, :department
    )
  end
end
