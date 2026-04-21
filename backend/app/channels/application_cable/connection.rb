module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      payload = token ? JwtService.decode(token) : nil
      user = payload ? User.find_by(id: payload[:user_id]) : nil

      user || reject_unauthorized_connection
    rescue StandardError
      reject_unauthorized_connection
    end
  end
end
