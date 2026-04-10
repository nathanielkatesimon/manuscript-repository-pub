class UserMailer < ApplicationMailer
  def password_reset(user)
    @user = user
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=#{CGI.escape(user.password_reset_token)}"
    mail(to: @user.email, subject: "Reset your password")
  end
end