class Api::V1::CategorySerializer < ActiveModel::Serializer
  attributes :id, :title, :name, :created_at, :updated_at
end
