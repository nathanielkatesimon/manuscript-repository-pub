require "test_helper"

class Api::V1::Admins::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admin001",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin@example.com",
      password: "password123"
    )
  end

  test "logs in an admin with valid credentials" do
    post api_v1_admins_session_path,
      params: {
        admin: {
          auth_id: "admin001",
          password: "password123"
        }
      },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Super", json.dig("data", "first_name")
    assert_equal "admin", json.dig("data", "role")
  end

  test "returns unauthorized with wrong password" do
    post api_v1_admins_session_path,
      params: {
        admin: {
          auth_id: "admin001",
          password: "wrongpassword"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns unauthorized with non-existent auth_id" do
    post api_v1_admins_session_path,
      params: {
        admin: {
          auth_id: "nonexistent",
          password: "password123"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end
end
