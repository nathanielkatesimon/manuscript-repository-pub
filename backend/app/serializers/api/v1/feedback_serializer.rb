class Api::V1::FeedbackSerializer < ActiveModel::Serializer
  attributes :id, :content, :user_id, :manuscript_id, :created_at, :updated_at,
             :user_first_name, :user_last_name

  def user_first_name
    object.user&.first_name
  end

  def user_last_name
    object.user&.last_name
  end
end
