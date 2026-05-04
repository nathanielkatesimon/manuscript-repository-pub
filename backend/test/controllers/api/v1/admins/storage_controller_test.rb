require "test_helper"

class Api::V1::Admins::StorageControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admst01",
      first_name: "Storage",
      last_name: "Admin",
      email: "storage.admin@example.com",
      password: "password123"
    )
    @token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  test "returns storage report for admin" do
    get api_v1_admins_storage_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body

    assert json.dig("data", "storage").present?
    assert json.dig("data", "breakdown").present?
    assert json.dig("data", "system").present?

    storage = json["data"]["storage"]
    assert storage.key?("total_size_bytes")
    assert storage.key?("total_size_mb")
    assert storage.key?("total_size_gb")
    assert storage.key?("total_files")
    assert storage.key?("average_size_bytes")
    assert storage.key?("average_size_mb")

    breakdown = json["data"]["breakdown"]
    assert breakdown.key?("pdfs")
    assert breakdown.key?("images")
    assert breakdown.key?("others")

    system_info = json["data"]["system"]
    assert system_info.key?("service_name")
    assert system_info.key?("manuscripts_count")
    assert system_info.key?("storage_per_manuscript_mb")
  end

  test "storage totals reflect uploaded blobs" do
    student = users(:student_one)
    adviser = users(:adviser_one)
    pdf = fixture_file_upload("sample.pdf", "application/pdf")
    Manuscript.create!(title: "Storage Test Paper", student: student, adviser: adviser, pdf: pdf)

    get api_v1_admins_storage_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body

    assert json["data"]["storage"]["total_files"] >= 1
    assert json["data"]["storage"]["total_size_bytes"] > 0
    assert json["data"]["breakdown"]["pdfs"]["count"] >= 1
    assert json["data"]["breakdown"]["pdfs"]["size_bytes"] > 0
    assert json["data"]["system"]["manuscripts_count"] >= 1
  end

  test "returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })

    get api_v1_admins_storage_path,
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end

  test "returns unauthorized without token" do
    get api_v1_admins_storage_path, as: :json

    assert_response :unauthorized
  end
end
