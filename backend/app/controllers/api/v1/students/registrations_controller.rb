class Api::V1::Students::RegistrationsController < ApplicationController
  def create
    student = Student.new(student_params)

    if student.save
      token = JwtService.encode({ user_id: student.id, role: student.role })
      render json: {
        data: Api::V1::StudentSerializer.new(student).as_json,
        token: token
      }, status: :created
    else
      render json: { errors: student.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def student_params
    params.require(:student).permit(
      :auth_id, :first_name, :middle_name, :last_name, :email,
      :password, :password_confirmation,
      :program_or_track, :year_level
    )
  end
end
