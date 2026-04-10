require "test_helper"

class Api::V1::AdvisersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student_one)
    @adviser = users(:adviser_one)
    @token = JwtService.encode({ user_id: @student.id, role: @student.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  test "returns a list of advisers" do
    get api_v1_advisers_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].any? { |a| a["role"] == "adviser" }
  end

  test "returns adviser fields" do
    get api_v1_advisers_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    adviser_data = json["data"].first
    assert adviser_data.key?("id")
    assert adviser_data.key?("first_name")
    assert adviser_data.key?("last_name")
    assert adviser_data.key?("department")
  end

  test "returns 401 when accessing advisers without token" do
    get api_v1_advisers_path, as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # SHOW
  test "returns a specific adviser" do
    get api_v1_adviser_path(@adviser), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @adviser.id, json.dig("data", "id")
    assert_equal @adviser.first_name, json.dig("data", "first_name")
    assert_equal @adviser.last_name, json.dig("data", "last_name")
  end

  test "returns not found for non-existent adviser" do
    get api_v1_adviser_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert_includes json["errors"], "Adviser not found"
  end

  test "returns 401 when accessing adviser show without token" do
    get api_v1_adviser_path(@adviser), as: :json

    assert_response :unauthorized
  end
end
