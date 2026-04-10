require "test_helper"

class Api::V1::Admins::StudentsControllerTest < ActionDispatch::IntegrationTest
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
    @student = users(:student_one)
  end

  # SHOW
  test "returns a specific student for admin" do
    get api_v1_admins_student_path(@student), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @student.id, json.dig("data", "id")
    assert_equal @student.first_name, json.dig("data", "first_name")
    assert_equal @student.last_name, json.dig("data", "last_name")
  end

  test "returns not found for non-existent student" do
    get api_v1_admins_student_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert_includes json["errors"], "Student not found"
  end

  test "show returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })
    get api_v1_admins_student_path(@student),
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end

  test "returns unauthorized without token" do
    get api_v1_admins_student_path(@student), as: :json

    assert_response :unauthorized
  end
end
