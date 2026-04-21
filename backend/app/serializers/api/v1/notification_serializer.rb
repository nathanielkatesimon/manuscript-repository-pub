class Api::V1::NotificationSerializer < ActiveModel::Serializer
  attributes :id, :message, :notification_type, :metadata, :read, :read_at, :created_at

  def read
    object.read_at.present?
  end
end
