require "test_helper"

class Api::V1::Advisers::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "registers an adviser with valid params" do
    post api_v1_advisers_registration_path,
      params: {
        adviser: {
          auth_id: "03-2345-678",
          first_name: "Maria",
          last_name: "Santos",
          email: "maria.santos@example.com",
          password: "password123",
          department: "Computer Science"
        }
      },
      as: :json

    assert_response :created
    json = response.parsed_body
    assert json["token"].present?
    assert_equal "Maria", json.dig("data", "first_name")
    assert_equal "adviser", json.dig("data", "role")
    assert_equal "maria.santos@example.com", json.dig("data", "email")
  end

  test "returns errors with invalid params" do
    post api_v1_advisers_registration_path,
      params: {
        adviser: {
          auth_id: "badid",
          first_name: "",
          last_name: "Santos",
          email: "invalid",
          password: "password123",
          department: "CS"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns error when auth_id is already taken" do
    Adviser.create!(
      auth_id: "04-2345-678",
      first_name: "Pedro",
      last_name: "Lim",
      email: "pedro.lim@example.com",
      password: "password123",
      department: "Engineering"
    )

    post api_v1_advisers_registration_path,
      params: {
        adviser: {
          auth_id: "04-2345-678",
          first_name: "Pedro",
          last_name: "Lim",
          email: "pedro.lim2@example.com",
          password: "password123",
          department: "Engineering"
        }
      },
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end
end
