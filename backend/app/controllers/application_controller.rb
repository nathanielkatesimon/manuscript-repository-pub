class ApplicationController < ActionController::API
  include Pagy::Backend

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = token ? JwtService.decode(token) : nil

    @current_user = User.find_by(id: payload[:user_id]) if payload

    render json: { errors: ["Unauthorized"] }, status: :unauthorized unless @current_user
  rescue JWT::ExpiredSignature
    render json: { errors: ["Session expired"] }, status: :unauthorized
  rescue StandardError
    render json: { errors: ["Unauthorized"] }, status: :unauthorized
  end

  def current_user
    @current_user
  end
end
