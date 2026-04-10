class Api::V1::Admins::ProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def show
    render json: { data: Api::V1::AdminSerializer.new(current_user).as_json }, status: :ok
  end

  def update
    if profile_params[:password].present?
      unless current_user.authenticate(profile_params[:current_password].to_s)
        return render json: { errors: ["Current password is incorrect"] }, status: :unprocessable_entity
      end
    end

    if current_user.update(update_params)
      render json: { data: Api::V1::AdminSerializer.new(current_user).as_json }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end

  def profile_params
    params.require(:admin).permit(
      :first_name, :middle_name, :last_name, :email,
      :avatar, :current_password, :password, :password_confirmation
    )
  end

  def update_params
    profile_params.except(:current_password)
  end
end
