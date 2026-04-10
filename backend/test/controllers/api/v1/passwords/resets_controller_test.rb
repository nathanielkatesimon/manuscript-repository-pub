require "test_helper"

class Api::V1::Passwords::ResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = Student.create!(
      auth_id: "66666666666",
      first_name: "Reset",
      last_name: "Tester",
      email: "reset.tester@example.com",
      password: "oldpassword123",
      program_or_track: "IT",
      year_level: "1"
    )
    @token = @student.password_reset_token
  end

  test "resets password with valid token" do
    post api_v1_passwords_reset_path,
      params: {
        user: {
          token: @token,
          password: "newpassword123",
          password_confirmation: "newpassword123"
        }
      },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Reset", json.dig("data", "first_name")

    @student.reload
    assert @student.authenticate("newpassword123")
  end

  test "returns error with invalid token" do
    post api_v1_passwords_reset_path,
      params: {
        user: {
          token: "invalid_token",
          password: "newpassword123",
          password_confirmation: "newpassword123"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns error when passwords do not match" do
    post api_v1_passwords_reset_path,
      params: {
        user: {
          token: @token,
          password: "newpassword123",
          password_confirmation: "differentpassword"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end
end
