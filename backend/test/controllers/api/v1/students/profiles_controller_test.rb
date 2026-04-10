require "test_helper"

class Api::V1::Students::ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = Student.create!(
      auth_id: "55512345678",
      first_name: "Carlos",
      last_name: "Dela Cruz",
      email: "carlos.delacruz@example.com",
      password: "password123",
      program_or_track: "BS Computer Science",
      year_level: "3"
    )
    @token = JwtService.encode({ user_id: @student.id, role: @student.role })
  end

  test "returns the current student profile" do
    get api_v1_students_profile_path,
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Carlos", json.dig("data", "first_name")
    assert_equal "student", json.dig("data", "role")
    assert_equal "carlos.delacruz@example.com", json.dig("data", "email")
  end

  test "returns unauthorized without token" do
    get api_v1_students_profile_path, as: :json

    assert_response :unauthorized
  end

  test "updates profile info" do
    patch api_v1_students_profile_path,
      params: {
        student: {
          first_name: "Karl",
          email: "karl.updated@example.com",
          program_or_track: "BS Information Technology",
          year_level: "4"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Karl", json.dig("data", "first_name")
    assert_equal "karl.updated@example.com", json.dig("data", "email")
    assert_equal "BS Information Technology", json.dig("data", "program_or_track")
    assert_equal "4", json.dig("data", "year_level")
  end

  test "updates password with correct current password" do
    patch api_v1_students_profile_path,
      params: {
        student: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    @student.reload
    assert @student.authenticate("newpassword456")
  end

  test "returns error when current password is wrong" do
    patch api_v1_students_profile_path,
      params: {
        student: {
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

  test "returns errors with invalid update params" do
    patch api_v1_students_profile_path,
      params: {
        student: {
          email: "not-an-email"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns forbidden when non-student token is used" do
    adviser = Adviser.create!(
      auth_id: "55-5555-555",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith.profile@example.com",
      password: "password123",
      department: "STEM"
    )
    adviser_token = JwtService.encode({ user_id: adviser.id, role: adviser.role })

    get api_v1_students_profile_path,
      headers: { "Authorization" => "Bearer #{adviser_token}" },
      as: :json

    assert_response :forbidden
  end
end
