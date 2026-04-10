class Api::V1::AdvisersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_adviser, only: :show

  def index
    advisers = Adviser.all
    render json: {
      data: ActiveModel::Serializer::CollectionSerializer.new(advisers, serializer: Api::V1::AdviserSerializer).as_json
    }, status: :ok
  end

  def show
    render json: { data: Api::V1::AdviserSerializer.new(@adviser).as_json }, status: :ok
  end

  private

  def set_adviser
    @adviser = Adviser.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Adviser not found"] }, status: :not_found
  end
end
