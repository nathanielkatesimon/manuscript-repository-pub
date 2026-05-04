require "test_helper"

class Api::V1::Admins::ReportsControllerTest < ActionDispatch::IntegrationTest
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

    student = users(:student_one)
    adviser = users(:adviser_one)

    # Create manuscripts with different statuses
    pdf = fixture_file_upload("sample.pdf", "application/pdf")
    @approved = Manuscript.create!(title: "Approved Paper", student: student, adviser: adviser, status: :approve, pdf: pdf)
    @rejected = Manuscript.create!(title: "Rejected Paper", student: student, adviser: adviser, status: :rejected, pdf: pdf)
    @revision = Manuscript.create!(title: "Revision Paper", student: student, adviser: adviser, status: :revision, pdf: pdf)
  end

  test "returns report summary and manuscript lists for admin" do
    get api_v1_admins_report_path, headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body

    assert json.dig("data", "summary").present?
    assert json.dig("data", "manuscripts").present?

    assert json["data"]["summary"]["approve"] >= 1
    assert json["data"]["summary"]["rejected"] >= 1
    assert json["data"]["summary"]["revision"] >= 1

    assert json["data"]["manuscripts"]["approve"].is_a?(Array)
    assert json["data"]["manuscripts"]["rejected"].is_a?(Array)
    assert json["data"]["manuscripts"]["revision"].is_a?(Array)

    assert json["data"]["manuscripts"]["approve"].any? { |m| m["title"] == "Approved Paper" }
    assert json["data"]["manuscripts"]["rejected"].any? { |m| m["title"] == "Rejected Paper" }
    assert json["data"]["manuscripts"]["revision"].any? { |m| m["title"] == "Revision Paper" }
  end

  test "returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })
    get api_v1_admins_report_path,
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end

  test "returns unauthorized without token" do
    get api_v1_admins_report_path, as: :json

    assert_response :unauthorized
  end
end
