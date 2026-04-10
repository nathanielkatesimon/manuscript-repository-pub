require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "valid student with required fields" do
    student = Student.new(
      auth_id: "12345678902",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe.new@example.com",
      password: "secret123",
      program_or_track: "Computer Science",
      year_level: "3"
    )
    assert student.valid?
  end

  test "student auth_id must be 11, 12, or 13 digits" do
    student = Student.new(
      auth_id: "123",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not student.valid?
    assert_includes student.errors[:auth_id], "must be 11, 12, or 13 digits"
  end

  test "student auth_id accepts 12 digits" do
    student = Student.new(
      auth_id: "123456789012",
      first_name: "John",
      last_name: "Doe",
      email: "john12@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert student.valid?
  end

  test "student auth_id accepts 13 digits" do
    student = Student.new(
      auth_id: "1234567890123",
      first_name: "John",
      last_name: "Doe",
      email: "john13@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert student.valid?
  end

  test "student requires program_or_track" do
    student = Student.new(
      auth_id: "12345678901",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe2@example.com",
      password: "secret123",
      year_level: "3"
    )
    assert_not student.valid?
    assert_includes student.errors[:program_or_track], "can't be blank"
  end

  test "student requires year_level" do
    student = Student.new(
      auth_id: "12345678901",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe3@example.com",
      password: "secret123",
      program_or_track: "CS"
    )
    assert_not student.valid?
    assert_includes student.errors[:year_level], "can't be blank"
  end

  test "valid adviser with required fields" do
    adviser = Adviser.new(
      auth_id: "02-2345-678",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith.new@example.com",
      password: "secret123",
      department: "Engineering"
    )
    assert adviser.valid?
  end

  test "adviser auth_id must match XX-XXXX-XXX format" do
    adviser = Adviser.new(
      auth_id: "12345678",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith2@example.com",
      password: "secret123",
      department: "Engineering"
    )
    assert_not adviser.valid?
    assert_includes adviser.errors[:auth_id], "must match format XX-XXXX-XXX"
  end

  test "adviser requires department" do
    adviser = Adviser.new(
      auth_id: "01-2345-678",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith3@example.com",
      password: "secret123"
    )
    assert_not adviser.valid?
    assert_includes adviser.errors[:department], "can't be blank"
  end

  test "valid admin with alphanumeric auth_id" do
    admin = Admin.new(
      auth_id: "Admin01",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin@example.com",
      password: "secret123"
    )
    assert admin.valid?
  end

  test "admin auth_id must be alphanumeric max 16 characters" do
    admin = Admin.new(
      auth_id: "Admin01!",
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin2@example.com",
      password: "secret123"
    )
    assert_not admin.valid?
    assert_includes admin.errors[:auth_id], "must be alphanumeric with max 16 characters"
  end

  test "admin auth_id cannot exceed 16 characters" do
    admin = Admin.new(
      auth_id: "A" * 17,
      first_name: "Super",
      last_name: "Admin",
      email: "super.admin3@example.com",
      password: "secret123"
    )
    assert_not admin.valid?
  end

  test "user requires first_name" do
    student = Student.new(
      auth_id: "12345678901",
      last_name: "Doe",
      email: "nodoe@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not student.valid?
    assert_includes student.errors[:first_name], "can't be blank"
  end

  test "user requires last_name" do
    student = Student.new(
      auth_id: "12345678901",
      first_name: "John",
      email: "nolast@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not student.valid?
    assert_includes student.errors[:last_name], "can't be blank"
  end

  test "user requires email" do
    student = Student.new(
      auth_id: "12345678901",
      first_name: "John",
      last_name: "Doe",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not student.valid?
    assert_includes student.errors[:email], "can't be blank"
  end

  test "user email must be valid format" do
    student = Student.new(
      auth_id: "12345678901",
      first_name: "John",
      last_name: "Doe",
      email: "not-an-email",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not student.valid?
    assert_includes student.errors[:email], "is not a valid email address"
  end

  test "user auth_id must be unique" do
    Student.create!(
      auth_id: "99999999999",
      first_name: "First",
      last_name: "User",
      email: "first@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    duplicate = Student.new(
      auth_id: "99999999999",
      first_name: "Second",
      last_name: "User",
      email: "second@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:auth_id], "has already been taken"
  end

  test "user email must be unique" do
    Student.create!(
      auth_id: "88888888888",
      first_name: "First",
      last_name: "User",
      email: "shared@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    duplicate = Student.new(
      auth_id: "77777777777",
      first_name: "Second",
      last_name: "User",
      email: "shared@example.com",
      password: "secret123",
      program_or_track: "CS",
      year_level: "1"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end
end
