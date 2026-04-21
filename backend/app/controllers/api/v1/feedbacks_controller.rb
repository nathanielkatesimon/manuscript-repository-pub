class Api::V1::FeedbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_manuscript

  def index
    feedbacks = @manuscript.feedbacks
    render json: {
      data: feedbacks.map { |f| Api::V1::FeedbackSerializer.new(f).as_json }
    }, status: :ok
  end

  def create
    feedback = @manuscript.feedbacks.new(feedback_params)
    feedback.user = current_user

    if feedback.save
      notify_student_for_feedback!(feedback)
      render json: { data: Api::V1::FeedbackSerializer.new(feedback).as_json }, status: :created
    else
      render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_manuscript
    @manuscript = Manuscript.find(params[:manuscript_id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Manuscript not found"] }, status: :not_found
  end

  def feedback_params
    params.require(:feedback).permit(:content)
  end

  def notify_student_for_feedback!(feedback)
    return unless current_user.is_a?(Adviser)

    NotificationDispatcher.notify(
      user: @manuscript.student,
      message: "Your manuscript \"#{@manuscript.title}\" received new feedback.",
      notification_type: "manuscript_feedback",
      metadata: { manuscript_id: @manuscript.id, feedback_id: feedback.id }
    )
  end
end
