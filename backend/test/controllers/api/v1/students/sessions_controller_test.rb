require "test_helper"

class Api::V1::Students::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = Student.create!(
      auth_id: "11234567890",
      first_name: "Alice",
      last_name: "Reyes",
      email: "alice.reyes.session@example.com",
      password: "password123",
      program_or_track: "Information Technology",
      year_level: "2"
    )
  end

  test "logs in a student with valid credentials" do
    post api_v1_students_session_path,
      params: {
        student: {
          auth_id: "11234567890",
          password: "password123"
        }
      },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Alice", json.dig("data", "first_name")
    assert_equal "student", json.dig("data", "role")
  end

  test "returns unauthorized with wrong password" do
    post api_v1_students_session_path,
      params: {
        student: {
          auth_id: "11234567890",
          password: "wrongpassword"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns unauthorized with non-existent auth_id" do
    post api_v1_students_session_path,
      params: {
        student: {
          auth_id: "99999999999",
          password: "password123"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end
end
