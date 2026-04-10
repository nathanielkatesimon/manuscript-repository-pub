require "test_helper"

class Api::V1::Advisers::ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @adviser = Adviser.create!(
      auth_id: "55-1234-567",
      first_name: "Maria",
      last_name: "Santos",
      email: "maria.santos@example.com",
      password: "password123",
      department: "STEM"
    )
    @token = JwtService.encode({ user_id: @adviser.id, role: @adviser.role })
  end

  test "returns the current adviser profile" do
    get api_v1_advisers_profile_path,
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Maria", json.dig("data", "first_name")
    assert_equal "adviser", json.dig("data", "role")
    assert_equal "maria.santos@example.com", json.dig("data", "email")
  end

  test "returns unauthorized without token" do
    get api_v1_advisers_profile_path, as: :json

    assert_response :unauthorized
  end

  test "updates profile info" do
    patch api_v1_advisers_profile_path,
      params: {
        adviser: {
          first_name: "Maricel",
          email: "maricel.updated@example.com",
          department: "ABM"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Maricel", json.dig("data", "first_name")
    assert_equal "maricel.updated@example.com", json.dig("data", "email")
    assert_equal "ABM", json.dig("data", "department")
  end

  test "updates password with correct current password" do
    patch api_v1_advisers_profile_path,
      params: {
        adviser: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }
      },
      headers: { "Authorization" => "Bearer #{@token}" },
      as: :json

    assert_response :ok
    @adviser.reload
    assert @adviser.authenticate("newpassword456")
  end

  test "returns error when current password is wrong" do
    patch api_v1_advisers_profile_path,
      params: {
        adviser: {
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

  test "returns forbidden when non-adviser token is used" do
    student = Student.create!(
      auth_id: "55512345679",
      first_name: "Bob",
      last_name: "Cruz",
      email: "bob.cruz.profile@example.com",
      password: "password123",
      program_or_track: "BS Computer Science",
      year_level: "2"
    )
    student_token = JwtService.encode({ user_id: student.id, role: student.role })

    get api_v1_advisers_profile_path,
      headers: { "Authorization" => "Bearer #{student_token}" },
      as: :json

    assert_response :forbidden
  end
end
