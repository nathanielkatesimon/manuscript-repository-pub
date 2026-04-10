class Manuscript < ApplicationRecord
  belongs_to :student, class_name: "Student"
  belongs_to :adviser, class_name: "Adviser"

  has_many :feedbacks, dependent: :destroy
  has_many :download_requests, dependent: :destroy

  has_one_attached :pdf
  has_one_attached :cover_img

  enum :status, { pending: "pending", approve: "approve", revision: "revision", rejected: "rejected" }

  validates :title, presence: true
  validates :status, presence: true
  validate :pdf_must_be_attached, on: :create
  validate :pdf_must_be_a_pdf, if: -> { pdf.attached? }

  after_create_commit :generate_cover_img

  def self.ransackable_attributes(auth_object = nil)
    %w[abstract adviser_id authors completion_date created_at id program_or_track research_type status student_id title updated_at]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[student adviser]
  end

  private

  def generate_cover_img
    return unless pdf.attached?

    pdf.blob.open do |tmp_file|
      image = MiniMagick::Image.open(tmp_file.path)
      page = image.pages.first
      return unless page

      page.format("jpg")

      Tempfile.create([ "cover_img", ".jpg" ]) do |output|
        page.write(output.path)
        cover_img.attach(
          io: File.open(output.path),
          filename: "#{title.parameterize}-cover.jpg",
          content_type: "image/jpeg"
        )
      end
    end
  rescue => e
    Rails.logger.error("Cover image generation failed for manuscript #{id}: #{e.message}")
  end

  def pdf_must_be_attached
    errors.add(:pdf, "must be attached") unless pdf.attached?
  end

  def pdf_must_be_a_pdf
    unless pdf.content_type.in?(%w[application/pdf])
      errors.add(:pdf, "must be a PDF file")
    end
  end
end
