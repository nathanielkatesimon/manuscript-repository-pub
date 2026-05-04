require "test_helper"

class Api::V1::Admins::AdvisersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admin001",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin@example.com",
      password: "password123"
    )
    @token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  # EXPORT
  test "exports advisers as xlsx for admin" do
    get export_api_v1_admins_advisers_path, headers: @auth_headers

    assert_response :ok
    assert_equal "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.content_type
    assert_match(/attachment; filename="advisers_\d{8}\.xlsx"/, response.headers["Content-Disposition"])
    assert response.body.length > 0
  end

  test "export returns unauthorized without token" do
    get export_api_v1_admins_advisers_path

    assert_response :unauthorized
  end

  test "export returns forbidden for non-admin user" do
    adviser = users(:adviser_one)
    token = JwtService.encode({ user_id: adviser.id, role: adviser.role })
    get export_api_v1_admins_advisers_path,
      headers: { "Authorization" => "Bearer #{token}" }

    assert_response :forbidden
  end
end
