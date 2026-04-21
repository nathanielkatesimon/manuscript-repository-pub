require "test_helper"

class Api::V1::Admins::ManuscriptsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admin001",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin@example.com",
      password: "password123"
    )
    @token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
    @manuscript = manuscripts(:manuscript_one)
  end

  # INDEX
  test "returns a list of manuscripts for admin" do
    get api_v1_admins_manuscripts_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert json["meta"].present?
    assert json["meta"]["total_count"].present?
  end

  test "returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })
    get api_v1_admins_manuscripts_path,
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end

  test "returns unauthorized without token" do
    get api_v1_admins_manuscripts_path, as: :json

    assert_response :unauthorized
  end

  test "filters manuscripts by title using ransack" do
    get api_v1_admins_manuscripts_path,
      params: { q: { title_cont: "Introduction" } },
      headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
  end

  test "paginates manuscripts" do
    get api_v1_admins_manuscripts_path,
      params: { page: 1, per_page: 1 },
      headers: @auth_headers

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
    assert_equal 1, json["meta"]["per_page"]
  end

  # SHOW
  test "returns a specific manuscript for admin" do
    ManuscriptAuditLog.create!(
      manuscript: @manuscript,
      editor: @admin,
      field_changes: { "status" => ["pending", "approve"] }
    )

    get api_v1_admins_manuscript_path(@manuscript), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert_equal @manuscript.id, json.dig("data", "id")
    assert_equal @manuscript.title, json.dig("data", "title")
    assert_equal @admin.id, json.dig("data", "audit_logs", 0, "editor_id")
    assert_equal @admin.role, json.dig("data", "audit_logs", 0, "editor_role")
    assert_equal "approve", json.dig("data", "audit_logs", 0, "field_changes", "status", 1)
  end

  test "returns not found for non-existent manuscript" do
    get api_v1_admins_manuscript_path(id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert_includes json["errors"], "Manuscript not found"
  end

  test "show returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })
    get api_v1_admins_manuscript_path(@manuscript),
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end
end
