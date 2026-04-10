class Api::V1::ManuscriptSerializer < ActiveModel::Serializer
  attributes :id, :title, :abstract, :authors, :completion_date,
             :program_or_track, :research_type, :status,
             :student_id, :adviser_id, :instructor, :created_at, :updated_at, :pdf_url, :cover_img_url,
             :student_name

  def pdf_url
    return nil unless object.pdf.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.pdf, only_path: true)
  end

  def cover_img_url
    return nil unless object.cover_img.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.cover_img, only_path: true)
  end

  def instructor
    adviser = object.adviser
    return nil unless adviser

    [adviser.first_name, adviser.middle_name, adviser.last_name].compact.join(" ")
  end

  def student_name
    student = object.student
    return nil unless student

    [student.first_name, student.middle_name, student.last_name].compact.join(" ")
  end
end
