require "test_helper"

class Api::V1::Passwords::ForgotsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = Student.create!(
      auth_id: "55555555555",
      first_name: "Forgot",
      last_name: "Tester",
      email: "forgot.tester@example.com",
      password: "password123",
      program_or_track: "IT",
      year_level: "1"
    )
  end

  test "sends reset email when email exists" do
    assert_emails 1 do
      post api_v1_passwords_forgot_path,
        params: { user: { email: "forgot.tester@example.com" } },
        as: :json
    end

    assert_response :ok
    json = response.parsed_body
    assert json["message"].present?
  end

  test "responds with success even when email does not exist" do
    assert_emails 0 do
      post api_v1_passwords_forgot_path,
        params: { user: { email: "nonexistent@example.com" } },
        as: :json
    end

    assert_response :ok
    json = response.parsed_body
    assert json["message"].present?
  end
end
