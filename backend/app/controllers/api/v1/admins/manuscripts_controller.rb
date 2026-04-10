class Api::V1::Admins::ManuscriptsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  before_action :set_manuscript, only: :show

  def index
    q = Manuscript.ransack(params[:q])
    manuscripts = q.result(distinct: true)
    pagy, paginated = pagy(manuscripts, limit: [[(params[:per_page]&.to_i || 20), 1].max, 100].min, page: params[:page]&.to_i || 1)
    render json: {
      data: paginated.map { |m| Api::V1::ManuscriptSerializer.new(m).as_json },
      meta: {
        current_page: pagy.page,
        total_pages: pagy.pages,
        total_count: pagy.count,
        per_page: pagy.limit
      }
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::ManuscriptSerializer.new(@manuscript).as_json }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: ["Forbidden"] }, status: :forbidden unless current_user.is_a?(Admin)
  end

  def set_manuscript
    @manuscript = Manuscript.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Manuscript not found"] }, status: :not_found
  end
end
