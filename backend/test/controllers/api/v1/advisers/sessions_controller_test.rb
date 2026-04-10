require "test_helper"

class Api::V1::Advisers::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @adviser = Adviser.create!(
      auth_id: "05-2345-678",
      first_name: "Maria",
      last_name: "Santos",
      email: "maria.santos.session@example.com",
      password: "password123",
      department: "Computer Science"
    )
  end

  test "logs in an adviser with valid credentials" do
    post api_v1_advisers_session_path,
      params: {
        adviser: {
          auth_id: "05-2345-678",
          password: "password123"
        }
      },
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Maria", json.dig("data", "first_name")
    assert_equal "adviser", json.dig("data", "role")
  end

  test "returns unauthorized with wrong password" do
    post api_v1_advisers_session_path,
      params: {
        adviser: {
          auth_id: "05-2345-678",
          password: "wrongpassword"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns unauthorized with non-existent auth_id" do
    post api_v1_advisers_session_path,
      params: {
        adviser: {
          auth_id: "99-9999-999",
          password: "password123"
        }
      },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end
end
