class Api::V1::Students::DownloadRequestsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_student!
  before_action :set_download_request, only: :show

  def index
    requests = DownloadRequest.where(student_id: current_user.id).order(created_at: :desc)
    pagy, paginated = pagy(requests, limit: [[(params[:per_page]&.to_i || 20), 1].max, 100].min, page: params[:page]&.to_i || 1)
    render json: {
      data: paginated.map { |dr| Api::V1::DownloadRequestSerializer.new(dr).as_json },
      meta: {
        current_page: pagy.page,
        total_pages: pagy.pages,
        total_count: pagy.count,
        per_page: pagy.limit
      }
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::DownloadRequestSerializer.new(@download_request).as_json }, status: :ok
  end

  def create
    download_request = DownloadRequest.new(
      student_id: current_user.id,
      manuscript_id: download_request_params[:manuscript_id],
      status: :pending
    )

    if download_request.save
      render json: { data: Api::V1::DownloadRequestSerializer.new(download_request).as_json }, status: :created
    else
      render json: { errors: download_request.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def authorize_student!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Student)
  end

  def set_download_request
    @download_request = DownloadRequest.find_by(id: params[:id], student_id: current_user.id)
    render json: { errors: ["Download request not found"] }, status: :not_found unless @download_request
  end

  def download_request_params
    params.require(:download_request).permit(:manuscript_id)
  end
end
