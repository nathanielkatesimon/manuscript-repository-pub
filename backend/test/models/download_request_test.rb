require "test_helper"

class DownloadRequestTest < ActiveSupport::TestCase
  def setup
    @student = Student.create!(
      auth_id: "11111111112",
      first_name: "Alice",
      last_name: "Walker",
      email: "download.student@example.com",
      password: "secret123",
      program_or_track: "Computer Science",
      year_level: "2"
    )
    @adviser = Adviser.create!(
      auth_id: "01-0001-002",
      first_name: "Bob",
      last_name: "Brown",
      email: "download.adviser@example.com",
      password: "secret123",
      department: "Engineering"
    )
    @manuscript = Manuscript.create!(
      title: "Download Test Paper",
      student: @student,
      adviser: @adviser,
      pdf: { io: File.open(Rails.root.join("test/fixtures/files/sample.pdf")),
             filename: "sample.pdf", content_type: "application/pdf" }
    )
  end

  test "valid download request with required fields" do
    request = DownloadRequest.new(student: @student, manuscript: @manuscript)
    assert request.valid?
  end

  test "download request status defaults to pending" do
    request = DownloadRequest.new(student: @student, manuscript: @manuscript)
    assert_equal "pending", request.status
  end

  test "download request status can be set to approved" do
    request = DownloadRequest.new(student: @student, manuscript: @manuscript, status: :approved)
    assert request.valid?
    assert request.approved?
  end

  test "download request status can be set to rejected with rejection_reason" do
    request = DownloadRequest.new(
      student: @student,
      manuscript: @manuscript,
      status: :rejected,
      rejection_reason: "Not authorized"
    )
    assert request.valid?
    assert request.rejected?
  end

  test "rejected download request requires rejection_reason" do
    request = DownloadRequest.new(student: @student, manuscript: @manuscript, status: :rejected)
    assert_not request.valid?
    assert_includes request.errors[:rejection_reason], "can't be blank"
  end

  test "download request requires student" do
    request = DownloadRequest.new(manuscript: @manuscript)
    assert_not request.valid?
  end

  test "download request requires manuscript" do
    request = DownloadRequest.new(student: @student)
    assert_not request.valid?
  end

  test "student has many download requests" do
    request = DownloadRequest.create!(student: @student, manuscript: @manuscript)
    assert_includes @student.download_requests, request
  end

  test "manuscript has many download requests" do
    request = DownloadRequest.create!(student: @student, manuscript: @manuscript)
    assert_includes @manuscript.download_requests, request
  end
end
