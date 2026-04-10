class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "noreply@aclcormoc.edu.ph")
  layout "mailer"
end
