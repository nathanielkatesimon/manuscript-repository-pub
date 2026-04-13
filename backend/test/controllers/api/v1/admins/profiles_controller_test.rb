require "test_helper"

class Api::V1::Admins::ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "adminprofile1",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin@example.com",
      password: "password123"
    )
    @token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
  end

  test "returns the current admin profile" do
    get api_v1_admins_profile_path,
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Super", json.dig("data", "first_name")
    assert_equal "admin", json.dig("data", "role")
    assert_equal "super.admin@example.com", json.dig("data", "email")
  end

  test "returns unauthorized without token" do
    get api_v1_admins_profile_path, as: :json

    assert_response :unauthorized
  end

  test "returns session expired error with expired token" do
    expired_token = JwtService.encode({ user_id: @admin.id, role: @admin.role }, exp: 1.hour.ago)

    get api_v1_admins_profile_path,
      headers: { "Authorization" => "Bearer #{expired_token}" },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert_includes json["errors"], "Session expired"
  end

  test "updates profile info" do
    patch api_v1_admins_profile_path,
      params: {
        admin: {
          first_name: "SuperUpdated",
          email: "super.updated@example.com"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "SuperUpdated", json.dig("data", "first_name")
    assert_equal "super.updated@example.com", json.dig("data", "email")
  end

  test "updates password with correct current password" do
    patch api_v1_admins_profile_path,
      params: {
        admin: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    @admin.reload
    assert @admin.authenticate("newpassword456")
  end

  test "returns error when current password is wrong" do
    patch api_v1_admins_profile_path,
      params: {
        admin: {
          current_password: "wrongpassword",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert_includes json["errors"], "Current password is incorrect"
  end

  test "returns forbidden when non-admin token is used" do
    student = Student.create!(
      auth_id: "55512345680",
      first_name: "Charlie",
      last_name: "Reyes",
      email: "charlie.reyes.admin@example.com",
      password: "password123",
      program_or_track: "BS Computer Science",
      year_level: "1"
    )
    student_token = JwtService.encode({ user_id: student.id, role: student.role })

    get api_v1_admins_profile_path,
      headers: { "Authorization" => "Bearer #{student_token}" },
      as: :json

    assert_response :forbidden
  end
end
