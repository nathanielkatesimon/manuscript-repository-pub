class Api::V1::StudentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_student, only: :show

  def show
    render json: { data: Api::V1::StudentSerializer.new(@student).as_json }, status: :ok
  end

  private

  def set_student
    @student = Student.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Student not found"] }, status: :not_found
  end
end
