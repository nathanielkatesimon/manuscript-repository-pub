require "test_helper"

class Api::V1::FeedbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @adviser = users(:adviser_one)
    @manuscript = manuscripts(:manuscript_one)
    @feedback = feedbacks(:feedback_one)
    @token = JwtService.encode({ user_id: @adviser.id, role: @adviser.role })
    @auth_headers = { "Authorization" => "Bearer #{@token}" }
  end

  # INDEX
  test "returns a list of feedbacks for a manuscript" do
    get api_v1_manuscript_feedbacks_path(@manuscript), headers: @auth_headers, as: :json

    assert_response :ok
    json = response.parsed_body
    assert json["data"].is_a?(Array)
  end

  test "returns 401 when accessing feedbacks without token" do
    get api_v1_manuscript_feedbacks_path(@manuscript), as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 404 when manuscript does not exist for index" do
    get api_v1_manuscript_feedbacks_path(manuscript_id: 0), headers: @auth_headers, as: :json

    assert_response :not_found
    json = response.parsed_body
    assert json["errors"].present?
  end

  # CREATE
  test "creates a feedback with valid params" do
    assert_difference("Feedback.count", 1) do
      post api_v1_manuscript_feedbacks_path(@manuscript),
        params: { feedback: { content: "Great work on the introduction." } },
        headers: @auth_headers,
        as: :json
    end

    assert_response :created
    json = response.parsed_body
    assert_equal "Great work on the introduction.", json.dig("data", "content")
    assert_equal @adviser.id, json.dig("data", "user_id")
    assert_equal @manuscript.id, json.dig("data", "manuscript_id")
  end

  test "returns errors when creating feedback without content" do
    post api_v1_manuscript_feedbacks_path(@manuscript),
      params: { feedback: { content: "" } },
      headers: @auth_headers,
      as: :json

    assert_response :unprocessable_entity
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 401 when creating feedback without token" do
    post api_v1_manuscript_feedbacks_path(@manuscript),
      params: { feedback: { content: "Some feedback." } },
      as: :json

    assert_response :unauthorized
    json = response.parsed_body
    assert json["errors"].present?
  end

  test "returns 404 when manuscript does not exist for create" do
    post api_v1_manuscript_feedbacks_path(manuscript_id: 0),
      params: { feedback: { content: "Some feedback." } },
      headers: @auth_headers,
      as: :json

    assert_response :not_found
    json = response.parsed_body
    assert json["errors"].present?
  end
end
