class Api::V1::StudentSerializer < ActiveModel::Serializer
  attributes :id, :auth_id, :first_name, :middle_name, :last_name, :email, :role,
             :program_or_track, :year_level, :created_at, :updated_at, :avatar_url

  def avatar_url
    return nil unless object.avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.avatar, only_path: true)
  end
end
