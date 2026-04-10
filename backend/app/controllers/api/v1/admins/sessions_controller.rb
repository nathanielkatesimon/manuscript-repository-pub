class Api::V1::Admins::SessionsController < ApplicationController
  def create
    admin = Admin.find_by(auth_id: params.dig(:admin, :auth_id))

    if admin&.authenticate(params.dig(:admin, :password))
      token = JwtService.encode({ user_id: admin.id, role: admin.role })
      render json: {
        data: Api::V1::AdminSerializer.new(admin).as_json,
        token: token
      }, status: :ok
    else
      render json: { errors: ["Invalid auth_id or password"] }, status: :unauthorized
    end
  end
end
