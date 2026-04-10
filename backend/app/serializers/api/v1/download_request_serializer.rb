class Api::V1::DownloadRequestSerializer < ActiveModel::Serializer
  attributes :id, :student_id, :student_name, :manuscript_id, :status, :rejection_reason, :created_at, :updated_at,
             :manuscript_title, :manuscript_cover_img_url, :manuscript_pdf_url

  def student_name
    student = object.student
    return nil unless student

    [ student.first_name, student.last_name ].compact.join(" ").presence
  end

  def manuscript_title
    object.manuscript&.title
  end

  def manuscript_cover_img_url
    return nil unless object.manuscript&.cover_img&.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.manuscript.cover_img, only_path: true)
  end

  def manuscript_pdf_url
    return nil unless object.manuscript&.pdf&.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.manuscript.pdf, only_path: true)
  end
end
