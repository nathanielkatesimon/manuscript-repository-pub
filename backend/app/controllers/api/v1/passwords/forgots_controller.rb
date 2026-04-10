class Api::V1::Passwords::ForgotsController < ApplicationController
  def create
    user = User.find_by(email: params.dig(:user, :email)&.downcase&.strip)

    if user
      UserMailer.password_reset(user).deliver_now
    end

    # Always respond with success to avoid email enumeration
    render json: { message: "If that email exists in our system, a reset link has been sent." }, status: :ok
  end
end