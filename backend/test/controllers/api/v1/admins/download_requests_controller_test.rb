require "test_helper"

class Api::V1::Admins::DownloadRequestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admin_notifications_1",
      first_name: "Notify",
      last_name: "Admin",
      email: "notify.admin@example.com",
      password: "password123"
    )
    @download_request = download_requests(:download_request_one)
    @admin_token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
    @auth_headers = { "Authorization" => "Bearer #{@admin_token}" }
  end

  test "notifies student when admin approves download request" do
    assert_difference("Notification.count", 1) do
      patch api_v1_admins_download_request_path(@download_request),
        params: { download_request: { status: "approved" } },
        headers: @auth_headers,
        as: :json
    end

    assert_response :ok

    notification = Notification.order(:created_at).last
    assert_equal @download_request.student_id, notification.user_id
    assert_equal "download_request_status_update", notification.notification_type
  end
end
