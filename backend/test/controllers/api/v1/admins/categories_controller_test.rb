require "test_helper"

class Api::V1::Admins::CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = Admin.create!(
      auth_id: "admin-category-001",
      first_name: "Category",
      last_name: "Admin",
      email: "category.admin@example.com",
      password: "password123"
    )
    @admin_token = JwtService.encode({ user_id: @admin.id, role: @admin.role })
    @admin_headers = { "Authorization" => "Bearer #{@admin_token}" }
    @category = categories(:bachelor_cs)
  end

  test "returns category list for admin" do
    get api_v1_admins_categories_path, headers: @admin_headers, as: :json

    assert_response :ok
    assert response.parsed_body["data"].is_a?(Array)
  end

  test "creates a category" do
    assert_difference("Category.count", 1) do
      post api_v1_admins_categories_path,
        params: { category: { title: "Graduate Programs", name: "MS Computer Science" } },
        headers: @admin_headers,
        as: :json
    end

    assert_response :created
    assert_equal "MS Computer Science", response.parsed_body.dig("data", "name")
  end

  test "updates a category" do
    patch api_v1_admins_category_path(@category),
      params: { category: { title: "Updated Group", name: "Updated Category Name" } },
      headers: @admin_headers,
      as: :json

    assert_response :ok
    assert_equal "Updated Category Name", response.parsed_body.dig("data", "name")
  end

  test "deletes a category" do
    assert_difference("Category.count", -1) do
      delete api_v1_admins_category_path(@category), headers: @admin_headers, as: :json
    end

    assert_response :ok
    assert_equal "Category deleted successfully", response.parsed_body["message"]
  end

  test "returns forbidden for non-admin user" do
    student = users(:student_one)
    token = JwtService.encode({ user_id: student.id, role: student.role })

    get api_v1_admins_categories_path,
      headers: { "Authorization" => "Bearer #{token}" },
      as: :json

    assert_response :forbidden
  end

  test "returns not found when category does not exist" do
    get api_v1_admins_category_path(id: 0), headers: @admin_headers, as: :json

    assert_response :not_found
    assert_includes response.parsed_body["errors"], "Category not found"
  end
end
