class Api::V1::Admins::StoragesController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def show
    blobs = ActiveStorage::Blob.all

    total_size  = blobs.sum(:byte_size)
    total_files = blobs.count

    pdf_blobs   = blobs.where(content_type: "application/pdf")
    image_blobs = blobs.where("content_type LIKE 'image/%'")
    other_blobs = blobs.where.not(content_type: [ "application/pdf" ]).where("content_type NOT LIKE 'image/%'")

    largest_blob = blobs.order(byte_size: :desc).first

    render json: {
      data: {
        storage: {
          total_size_bytes:  total_size,
          total_size_mb:     (total_size.to_f / 1.megabyte).round(2),
          total_size_gb:     (total_size.to_f / 1.gigabyte).round(4),
          total_files:       total_files,
          average_size_bytes: total_files > 0 ? (total_size.to_f / total_files).round(2) : 0,
          average_size_mb:    total_files > 0 ? (total_size.to_f / total_files / 1.megabyte).round(2) : 0
        },
        breakdown: {
          pdfs: {
            count:      pdf_blobs.count,
            size_bytes: pdf_blobs.sum(:byte_size),
            size_mb:    (pdf_blobs.sum(:byte_size).to_f / 1.megabyte).round(2)
          },
          images: {
            count:      image_blobs.count,
            size_bytes: image_blobs.sum(:byte_size),
            size_mb:    (image_blobs.sum(:byte_size).to_f / 1.megabyte).round(2)
          },
          others: {
            count:      other_blobs.count,
            size_bytes: other_blobs.sum(:byte_size),
            size_mb:    (other_blobs.sum(:byte_size).to_f / 1.megabyte).round(2)
          }
        },
        largest_file: largest_blob ? {
          filename:    largest_blob.filename.to_s,
          size_bytes:  largest_blob.byte_size,
          size_mb:     (largest_blob.byte_size.to_f / 1.megabyte).round(2),
          content_type: largest_blob.content_type,
          created_at:  largest_blob.created_at
        } : nil,
        system: {
          service_name:    ActiveStorage::Blob.service.name,
          manuscripts_count: Manuscript.count,
          storage_per_manuscript_mb: Manuscript.count > 0 ? ((total_size.to_f / 1.megabyte) / Manuscript.count).round(2) : 0
        }
      }
    }, status: :ok
  end

  private

  def authorize_admin!
    render json: { errors: [ "Forbidden" ] }, status: :forbidden unless current_user.is_a?(Admin)
  end
end
