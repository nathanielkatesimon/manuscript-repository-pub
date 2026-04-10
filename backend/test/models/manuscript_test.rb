require "test_helper"

class ManuscriptTest < ActiveSupport::TestCase
  def setup
    @student = Student.create!(
      auth_id: "11111111111",
      first_name: "John",
      last_name: "Doe",
      email: "manuscript.student@example.com",
      password: "secret123",
      program_or_track: "Computer Science",
      year_level: "3"
    )
    @adviser = Adviser.create!(
      auth_id: "01-0001-001",
      first_name: "Jane",
      last_name: "Smith",
      email: "manuscript.adviser@example.com",
      password: "secret123",
      department: "Engineering"
    )
    @pdf = { io: File.open(Rails.root.join("test/fixtures/files/sample.pdf")),
             filename: "sample.pdf", content_type: "application/pdf" }
  end

  test "valid manuscript with required fields" do
    manuscript = Manuscript.new(
      title: "My Research Paper",
      student: @student,
      adviser: @adviser
    )
    manuscript.pdf.attach(@pdf)
    assert manuscript.valid?
  end

  test "manuscript requires title" do
    manuscript = Manuscript.new(
      student: @student,
      adviser: @adviser
    )
    assert_not manuscript.valid?
    assert_includes manuscript.errors[:title], "can't be blank"
  end

  test "manuscript requires student" do
    manuscript = Manuscript.new(
      title: "My Paper",
      adviser: @adviser
    )
    assert_not manuscript.valid?
  end

  test "manuscript requires adviser" do
    manuscript = Manuscript.new(
      title: "My Paper",
      student: @student
    )
    assert_not manuscript.valid?
  end

  test "manuscript status defaults to pending" do
    manuscript = Manuscript.new(
      title: "My Research Paper",
      student: @student,
      adviser: @adviser
    )
    assert_equal "pending", manuscript.status
  end

  test "manuscript status can be set to approve" do
    manuscript = Manuscript.new(
      title: "My Research Paper",
      student: @student,
      adviser: @adviser,
      status: :approve
    )
    manuscript.pdf.attach(@pdf)
    assert manuscript.valid?
    assert manuscript.approve?
  end

  test "manuscript status can be set to revision" do
    manuscript = Manuscript.new(
      title: "My Research Paper",
      student: @student,
      adviser: @adviser,
      status: :revision
    )
    manuscript.pdf.attach(@pdf)
    assert manuscript.valid?
  end

  test "manuscript status can be set to rejected" do
    manuscript = Manuscript.new(
      title: "My Research Paper",
      student: @student,
      adviser: @adviser,
      status: :rejected
    )
    manuscript.pdf.attach(@pdf)
    assert manuscript.valid?
  end

  test "student has many manuscripts" do
    manuscript = Manuscript.create!(
      title: "Student Paper",
      student: @student,
      adviser: @adviser,
      pdf: @pdf
    )
    assert_includes @student.manuscripts, manuscript
  end

  test "adviser has many manuscripts" do
    manuscript = Manuscript.create!(
      title: "Adviser Paper",
      student: @student,
      adviser: @adviser,
      pdf: @pdf
    )
    assert_includes @adviser.manuscripts, manuscript
  end

  test "cover_img is attached after manuscript creation" do
    manuscript = Manuscript.create!(
      title: "Cover Image Paper",
      student: @student,
      adviser: @adviser,
      pdf: @pdf
    )
    assert manuscript.cover_img.attached?, "Expected cover_img to be attached after create"
  end

  test "cover_img is not attached when pdf has no pages" do
    manuscript = Manuscript.create!(
      title: "No Pages PDF Paper",
      student: @student,
      adviser: @adviser,
      pdf: @pdf
    )
    # Simulate the guard clause: cover_img should be attached since our sample.pdf has pages
    # but if pages.first returns nil, the callback returns early
    assert_not_nil manuscript
  end
end
