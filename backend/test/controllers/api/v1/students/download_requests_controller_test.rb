require "test_helper"

class Api::V1::Students::DownloadRequestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student_one)
    @adviser = users(:adviser_one)
    @manuscript = manuscripts(:manuscript_one)
    @download_request = download_requests(:download_request_one)
    @student_token = JwtService.encode({ user_id: @student.id, role: @student.role })
    @adviser_token = JwtService.encode({ user_id: @adviser.id, role: @adviser.role })
    @auth_headers = { "Authorization" => "Bearer #{@student_token}" }
  end

  # INDEX
  test "returns a list of download requests for current student" do
    get api_v1_students_download_requests_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["meta"].present?
    assert json["data"].all? { |dr| dr["student_id"] == @student.id }
  end

  test "returns 401 on index without token" do
    get api_v1_students_download_requests_path, as: :json

    assert_response :unauthorized
  end

  test "returns 403 on index for adviser" do
    get api_v1_students_download_requests_path,
      headers: { "Authorization" => "Bearer #{@adviser_token}" },
      as: :json

    assert_response :forbidden
  end

  # SHOW
  test "returns a single download request" do
    get api_v1_students_download_request_path(@download_request), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @download_request.id, json.dig("data", "id")
    assert_equal @student.id, json.dig("data", "student_id")
    assert json.dig("data", "manuscript_title").present?
  end

  test "returns 404 when download request does not belong to current student" do
    other_student = Student.create!(
      auth_id: "99999999999",
      first_name: "Other",
      last_name: "Student",
      email: "other.student@example.com",
      password: "password123",
      program_or_track: "CS",
      year_level: "1"
    )
    other_token = JwtService.encode({ user_id: other_student.id, role: other_student.role })

    get api_v1_students_download_request_path(@download_request),
      headers: { "Authorization" => "Bearer #{other_token}" },
      as: :json

    assert_response :not_found
  end

  test "returns 401 on show without token" do
    get api_v1_students_download_request_path(@download_request), as: :json

    assert_response :unauthorized
  end

  # CREATE
  test "creates a download request with valid params" do
    assert_difference("DownloadRequest.count", 1) do
      post api_v1_students_download_requests_path,
        params: { download_request: { manuscript_id: @manuscript.id } },
        headers: @auth_headers,
        as: :json
    end

    assert_response :created
    json = response.parsed_body
    assert_equal @student.id, json.dig("data", "student_id")
    assert_equal @manuscript.id, json.dig("data", "manuscript_id")
    assert_equal "pending", json.dig("data", "status")
  end

  test "always creates a new download request even when one already exists" do
    assert_difference("DownloadRequest.count", 1) do
      post api_v1_students_download_requests_path,
        params: { download_request: { manuscript_id: @manuscript.id } },
        headers: @auth_headers,
        as: :json
    end

    assert_response :created
  end

  test "returns 400 when download_request params are missing" do
    post api_v1_students_download_requests_path,
      params: {},
      headers: @auth_headers,
      as: :json

    assert_response :bad_request
  end

  test "returns 401 without token" do
    post api_v1_students_download_requests_path,
      params: { download_request: { manuscript_id: @manuscript.id } },
      as: :json

    assert_response :unauthorized
  end

  test "returns 403 when adviser tries to create a download request" do
    post api_v1_students_download_requests_path,
      params: { download_request: { manuscript_id: @manuscript.id } },
      headers: { "Authorization" => "Bearer #{@adviser_token}" },
      as: :json

    assert_response :forbidden
  end
end
