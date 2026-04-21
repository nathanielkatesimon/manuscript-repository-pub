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
      notify_adviser_for_new_manuscript!(manuscript)
      render json: { data: Api::V1::ManuscriptSerializer.new(manuscript).as_json }, status: :created
    else
      render json: { errors: manuscript.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @manuscript.update(manuscript_params)
      create_audit_log!
      notify_student_for_status_update!
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

  def create_audit_log!
    changed_fields = @manuscript.saved_changes.except("updated_at")
    return if changed_fields.empty?

    @manuscript.audit_logs.create!(
      editor: current_user,
      field_changes: changed_fields
    )
  end

  def notify_student_for_status_update!
    return unless current_user.is_a?(Adviser)
    return unless @manuscript.saved_change_to_status?

    status_text = @manuscript.status == "approve" ? "approved" : @manuscript.status.humanize.downcase

    NotificationDispatcher.notify(
      user: @manuscript.student,
      message: "Your manuscript \"#{@manuscript.title}\" status was updated to #{status_text}.",
      notification_type: "manuscript_status_update",
      metadata: { manuscript_id: @manuscript.id, status: @manuscript.status }
    )
  end

  def notify_adviser_for_new_manuscript!(manuscript)
    return unless current_user.is_a?(Student)
    return unless manuscript.student_id == current_user.id
    return unless manuscript.adviser

    student_name = [manuscript.student.first_name, manuscript.student.last_name].compact.join(" ")

    NotificationDispatcher.notify(
      user: manuscript.adviser,
      message: "A new manuscript \"#{manuscript.title}\" was uploaded by #{student_name}.",
      notification_type: "new_manuscript_upload",
      metadata: { manuscript_id: manuscript.id, student_id: manuscript.student_id }
    )
  end
end
