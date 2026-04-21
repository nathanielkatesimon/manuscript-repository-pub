require "test_helper"

class Api::V1::CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student_one)
    @token = JwtService.encode({ user_id: @student.id, role: @student.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  test "returns a list of categories for authenticated users" do
    get api_v1_categories_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].any? { |category| category["name"] == categories(:bachelor_cs).name }
  end

  test "returns unauthorized without token" do
    get api_v1_categories_path, as: :json

    assert_response :unauthorized
    assert_includes response.parsed_body["errors"], "Unauthorized"
  end
end
