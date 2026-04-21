require "test_helper"

class Api::V1::NotificationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student_one)
    @token = JwtService.encode({ user_id: @student.id, role: @student.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
    @notification = notifications(:notification_one)
  end

  test "returns current user notifications" do
    get api_v1_notifications_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert_equal 1, json.dig("meta", "unread_count")
  end

  test "marks a single notification as read" do
    patch api_v1_notification_path(@notification), headers: @auth_headers, as: :json

    assert_response :ok
    assert notifications(:notification_one).reload.read_at.present?
  end

  test "marks all notifications as read" do
    patch mark_all_read_api_v1_notifications_path, headers: @auth_headers, as: :json

    assert_response :ok
    assert_equal 0, @student.notifications.unread.count
  end
end
