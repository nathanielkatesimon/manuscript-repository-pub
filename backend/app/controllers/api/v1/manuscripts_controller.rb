class Api::V1::ManuscriptsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_manuscript, only: %i[show update destroy my_download_request]

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

  def create
    manuscript = Manuscript.new(manuscript_params)

    if manuscript.save
      render json: { data: Api::V1::ManuscriptSerializer.new(manuscript).as_json }, status: :created
    else
      render json: { errors: manuscript.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @manuscript.update(manuscript_params)
      render json: { data: Api::V1::ManuscriptSerializer.new(@manuscript).as_json }, status: :ok
    else
      render json: { errors: @manuscript.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @manuscript.destroy
    render json: { message: "Manuscript deleted successfully" }, status: :ok
  end

  def my_download_request
    download_request = @manuscript.download_requests.find_by(student_id: current_user.id)
    if download_request
      render json: { data: Api::V1::DownloadRequestSerializer.new(download_request).as_json }, status: :ok
    else
      render json: { data: nil }, status: :ok
    end
  end

  private

  def set_manuscript
    @manuscript = Manuscript.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Manuscript not found"] }, status: :not_found
  end

  def manuscript_params
    params.require(:manuscript).permit(
      :title, :abstract, :authors, :completion_date,
      :program_or_track, :research_type, :status,
      :student_id, :adviser_id, :pdf
    )
  end
end
