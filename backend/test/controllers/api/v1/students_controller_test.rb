require "test_helper"

class Api::V1::StudentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @adviser = users(:adviser_one)
    @student = users(:student_one)
    @token = JwtService.encode({ user_id: @adviser.id, role: @adviser.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  test "returns a specific student for authenticated user" do
    get api_v1_student_path(@student), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @student.id, json.dig("data", "id")
    assert_equal @student.first_name, json.dig("data", "first_name")
    assert_equal @student.last_name, json.dig("data", "last_name")
  end

  test "returns not found for non-existent student" do
    get api_v1_student_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert_includes json["errors"], "Student not found"
  end

  test "returns 401 when accessing student show without token" do
    get api_v1_student_path(@student), as: :json

    assert_response :unauthorized
  end

  test "returns session expired error with expired token" do
    expired_token = JwtService.encode({ user_id: @student.id, role: @student.role }, exp: 1.hour.ago)

    get api_v1_student_path(@student),
      headers: { "Authorization" => "Bearer #{expired_token}" },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert_includes json["errors"], "Session expired"
  end
end
