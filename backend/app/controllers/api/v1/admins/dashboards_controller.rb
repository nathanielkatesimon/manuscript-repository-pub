class Api::V1::Admins::DashboardsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def show
    render json: {
      data: {
        students_count: Student.count,
        advisers_count: Adviser.count,
        manuscripts_count: Manuscript.count,
        download_requests: {
          total: DownloadRequest.count,
          pending: DownloadRequest.pending.count,
          approved: DownloadRequest.approved.count,
          rejected: DownloadRequest.rejected.count
        }
      }
    }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end
end
