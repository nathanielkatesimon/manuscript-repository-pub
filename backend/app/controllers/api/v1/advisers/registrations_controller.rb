class Api::V1::Advisers::RegistrationsController < ApplicationController
  def create
    adviser = Adviser.new(adviser_params)

    if adviser.save
      token = JwtService.encode({ user_id: adviser.id, role: adviser.role })
      render json: {
        data: Api::V1::AdviserSerializer.new(adviser).as_json,
        token: token
      }, status: :created
    else
      render json: { errors: adviser.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def adviser_params
    params.require(:adviser).permit(
      :auth_id, :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation,
      :department
    )
  end
end
