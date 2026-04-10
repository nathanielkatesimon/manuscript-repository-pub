class Api::V1::Passwords::ResetsController < ApplicationController
  def create
    user = User.find_by_password_reset_token(params.dig(:user, :token))

    unless user
      return render json: { errors: ["Reset link is invalid or has expired."] }, status: :unprocessable_entity
    end

    if user.update(password: params.dig(:user, :password), password_confirmation: params.dig(:user, :password_confirmation))
      token = JwtService.encode({ user_id: user.id, role: user.role })
      serializer = serializer_for(user)
      render json: { data: serializer.as_json, token: token }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def serializer_for(user)
    case user.role
    when "student"
      Api::V1::StudentSerializer.new(user)
    when "adviser"
      Api::V1::AdviserSerializer.new(user)
    else
      Api::V1::AdminSerializer.new(user)
    end
  end
end
