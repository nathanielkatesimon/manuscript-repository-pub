require "test_helper"

class Api::V1::ManuscriptsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student_one)
    @adviser = users(:adviser_one)
    @manuscript = manuscripts(:manuscript_one)
    @token = JwtService.encode({ user_id: @student.id, role: @student.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  # INDEX
  test "returns a list of manuscripts" do
    get api_v1_manuscripts_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
  end

  test "filters manuscripts by title using ransack" do
    get api_v1_manuscripts_path, params: { q: { title_cont: "Introduction" } }, headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].any? { |m| m["title"].include?("Introduction") }
  end

  test "returns empty array when ransack filter matches nothing" do
    get api_v1_manuscripts_path, params: { q: { title_cont: "zzznomatch" } }, headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert_equal [], json["data"]
  end

  test "filters manuscripts by status using ransack" do
    get api_v1_manuscripts_path, params: { q: { status_eq: "pending" } }, headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].all? { |m| m["status"] == "pending" }
  end

  test "filters manuscripts by adviser_id using ransack" do
    get api_v1_manuscripts_path, params: { q: { adviser_id_eq: @adviser.id } }, headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].all? { |m| m["adviser_id"] == @adviser.id }
  end

  test "filters manuscripts by adviser_id and status using ransack" do
    get api_v1_manuscripts_path,
      params: { q: { adviser_id_eq: @adviser.id, status_eq: "pending" } },
      headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["data"].all? { |m| m["adviser_id"] == @adviser.id && m["status"] == "pending" }
  end

  test "returns 401 when accessing index without token" do
    get api_v1_manuscripts_path, as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # SHOW
  test "returns a single manuscript" do
    get api_v1_manuscript_path(@manuscript), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @manuscript.title, json.dig("data", "title")
  end

  test "returns 404 for a non-existent manuscript" do
    get api_v1_manuscript_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 401 when accessing show without token" do
    get api_v1_manuscript_path(@manuscript), as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # CREATE
  test "creates a manuscript with valid params and PDF" do
    pdf_file = fixture_file_upload("sample.pdf", "application/pdf")

    post api_v1_manuscripts_path,
      params: {
        manuscript: {
          title: "New Research Paper",
          abstract: "An abstract.",
          status: "pending",
          student_id: @student.id,
          adviser_id: @adviser.id,
          pdf: pdf_file
        }
      },
      headers: @auth_headers

    assert_response :created
    json = response.parsed_body
    assert_equal "New Research Paper", json.dig("data", "title")
    assert_equal "pending", json.dig("data", "status")
    assert json.dig("data", "pdf_url").present?
    assert json.dig("data", "cover_img_url").present?
  end

  test "returns errors when creating without a PDF" do
    post api_v1_manuscripts_path,
      params: {
        manuscript: {
          title: "No PDF Paper",
          status: "pending",
          student_id: @student.id,
          adviser_id: @adviser.id
        }
      },
      headers: @auth_headers,
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns errors when creating with missing title" do
    pdf_file = fixture_file_upload("sample.pdf", "application/pdf")

    post api_v1_manuscripts_path,
      params: {
        manuscript: {
          abstract: "Missing title.",
          status: "pending",
          student_id: @student.id,
          adviser_id: @adviser.id,
          pdf: pdf_file
        }
      },
      headers: @auth_headers

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 401 when creating without token" do
    post api_v1_manuscripts_path,
      params: { manuscript: { title: "Test" } },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # UPDATE
  test "updates a manuscript with valid params" do
    patch api_v1_manuscript_path(@manuscript),
      params: {
        manuscript: {
          title: "Updated Title",
          status: "approve"
        }
      },
      headers: @auth_headers,
      as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal "Updated Title", json.dig("data", "title")
    assert_equal "approve", json.dig("data", "status")
  end

  test "returns errors when updating with invalid params" do
    patch api_v1_manuscript_path(@manuscript),
      params: {
        manuscript: {
          title: ""
        }
      },
      headers: @auth_headers,
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 404 when updating a non-existent manuscript" do
    patch api_v1_manuscript_path(id: 0),
      params: { manuscript: { title: "Title" } },
      headers: @auth_headers,
      as: :json

    assert_response :not_found
  end

  test "returns 401 when updating without token" do
    patch api_v1_manuscript_path(@manuscript),
      params: { manuscript: { title: "Title" } },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # DESTROY
  test "deletes a manuscript" do
    assert_difference("Manuscript.count", -1) do
      delete api_v1_manuscript_path(@manuscript), headers: @auth_headers, as: :json
    end

    assert_response :ok
    json = response.parsed_body
    assert json["message"].present?
  end

  test "returns 404 when deleting a non-existent manuscript" do
    delete api_v1_manuscript_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
  end

  test "returns 401 when deleting without token" do
    delete api_v1_manuscript_path(@manuscript), as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  # MY_DOWNLOAD_REQUEST
  test "returns existing download request for current student" do
    get my_download_request_api_v1_manuscript_path(@manuscript), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @student.id, json.dig("data", "student_id")
    assert_equal @manuscript.id, json.dig("data", "manuscript_id")
  end

  test "returns nil data when no download request exists" do
    DownloadRequest.where(student_id: @student.id, manuscript_id: @manuscript.id).destroy_all

    get my_download_request_api_v1_manuscript_path(@manuscript), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_nil json["data"]
  end

  test "returns 401 when accessing my_download_request without token" do
    get my_download_request_api_v1_manuscript_path(@manuscript), as: :json

    assert_response :unauthorized
  end
end
