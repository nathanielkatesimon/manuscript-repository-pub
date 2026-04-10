class Api::V1::Advisers::SessionsController < ApplicationController
  def create
    adviser = Adviser.find_by(auth_id: params.dig(:adviser, :auth_id))

    if adviser&.authenticate(params.dig(:adviser, :password))
      token = JwtService.encode({ user_id: adviser.id, role: adviser.role })
      render json: {
        data: Api::V1::AdviserSerializer.new(adviser).as_json,
        token: token
      }, status: :ok
    else
      render json: { errors: ["Invalid auth_id or password"] }, status: :unauthorized
    end
  end
end
