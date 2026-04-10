class Api::V1::Admins::StudentsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_student, only: %i[show update destroy]

  def index
    students = Student.order(created_at: :desc)
    render json: {
      data: students.map { |s| Api::V1::StudentSerializer.new(s).as_json }
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::StudentSerializer.new(@student).as_json }, status: :ok
  end

  def create
    student = Student.new(create_params)

    if student.save
      render json: { data: Api::V1::StudentSerializer.new(student).as_json }, status: :created
    else
      render json: { errors: student.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @student.update(update_params)
      render json: { data: Api::V1::StudentSerializer.new(@student).as_json }, status: :ok
    else
      render json: { errors: @student.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @student.destroy
    render json: { message: "Student deleted successfully" }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end

  def set_student
    @student = Student.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Student not found"] }, status: :not_found
  end

  def create_params
    params.require(:student).permit(
      :auth_id, :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation, :program_or_track, :year_level
    )
  end

  def update_params
    params.require(:student).permit(
      :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation, :program_or_track, :year_level
    )
  end
end
