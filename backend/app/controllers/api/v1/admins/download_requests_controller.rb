class Api::V1::Admins::DownloadRequestsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_download_request, only: %i[show update]

  def index
    download_requests = DownloadRequest.includes(:student, :manuscript).order(created_at: :desc)
    download_requests = download_requests.where(student_id: params[:student_id]) if params[:student_id].present?
    render json: {
      data: download_requests.map { |dr| Api::V1::DownloadRequestSerializer.new(dr).as_json }
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::DownloadRequestSerializer.new(@download_request).as_json }, status: :ok
  end

  def update
    if @download_request.update(download_request_params)
      notify_student_for_decision!
      render json: { data: Api::V1::DownloadRequestSerializer.new(@download_request).as_json }, status: :ok
    else
      render json: { errors: @download_request.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end

  def set_download_request
    @download_request = DownloadRequest.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Download request not found"] }, status: :not_found
  end

  def download_request_params
    params.require(:download_request).permit(:status, :rejection_reason)
  end

  def notify_student_for_decision!
    return unless @download_request.saved_change_to_status?
    return unless @download_request.approved? || @download_request.rejected?

    status_text = @download_request.status.humanize.downcase
    manuscript_title = @download_request.manuscript&.title || "your manuscript"

    NotificationDispatcher.notify(
      user: @download_request.student,
      message: "Your download request for \"#{manuscript_title}\" was #{status_text}.",
      notification_type: "download_request_status_update",
      metadata: {
        download_request_id: @download_request.id,
        manuscript_id: @download_request.manuscript_id,
        status: @download_request.status
      }
    )
  end
end
