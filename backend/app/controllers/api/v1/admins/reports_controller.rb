class Api::V1::Admins::ReportsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def show
    render json: {
      data: {
        summary: {
          approve: Manuscript.approve.count,
          rejected: Manuscript.rejected.count,
          revision: Manuscript.revision.count
        },
        manuscripts: {
          approve: Manuscript.approve.map { |m| Api::V1::ManuscriptSerializer.new(m).as_json },
          rejected: Manuscript.rejected.map { |m| Api::V1::ManuscriptSerializer.new(m).as_json },
          revision: Manuscript.revision.map { |m| Api::V1::ManuscriptSerializer.new(m).as_json }
        }
      }
    }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end
end
