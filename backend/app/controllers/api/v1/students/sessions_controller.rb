class Api::V1::Students::SessionsController < ApplicationController
  def create
    student = Student.find_by(auth_id: params.dig(:student, :auth_id))

    if student&.authenticate(params.dig(:student, :password))
      token = JwtService.encode({ user_id: student.id, role: student.role })
      render json: {
        data: Api::V1::StudentSerializer.new(student).as_json,
        token: token
      }, status: :ok
    else
      render json: { errors: ["Invalid auth_id or password"] }, status: :unauthorized
    end
  end
end
