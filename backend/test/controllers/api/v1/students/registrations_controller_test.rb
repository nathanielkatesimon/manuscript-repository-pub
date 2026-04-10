require "test_helper"

class Api::V1::Students::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "registers a student with valid params" do
    post api_v1_students_registration_path,
      params: {
        student: {
          auth_id: "22345678901",
          first_name: "Alice",
          last_name: "Reyes",
          email: "alice.reyes@example.com",
          password: "password123",
          program_or_track: "Information Technology",
          year_level: "2"
        }
      },
      as: :json

    assert_response :created
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Alice", json.dig("data", "first_name")
    assert_equal "student", json.dig("data", "role")
    assert_equal "alice.reyes@example.com", json.dig("data", "email")
  end

  test "returns errors with invalid params" do
    post api_v1_students_registration_path,
      params: {
        student: {
          auth_id: "123",
          first_name: "",
          last_name: "Reyes",
          email: "invalid",
          password: "password123",
          program_or_track: "IT",
          year_level: "2"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns error when auth_id is already taken" do
    Student.create!(
      auth_id: "33345678901",
      first_name: "Bob",
      last_name: "Cruz",
      email: "bob.cruz@example.com",
      password: "password123",
      program_or_track: "CS",
      year_level: "1"
    )

    post api_v1_students_registration_path,
      params: {
        student: {
          auth_id: "33345678901",
          first_name: "Bob",
          last_name: "Cruz",
          email: "bob.cruz2@example.com",
          password: "password123",
          program_or_track: "CS",
          year_level: "1"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end
end
