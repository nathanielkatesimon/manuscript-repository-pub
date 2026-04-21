class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_notification, only: :update

  def index
    notifications = current_user.notifications.order(created_at: :desc).limit(20)
    render json: {
      data: notifications.map { |notification| Api::V1::NotificationSerializer.new(notification).as_json },
      meta: {
        unread_count: current_user.notifications.unread.count
      }
    }, status: :ok
  end

  def update
    @notification.update(read_at: Time.current) if @notification.read_at.nil?
    render json: { data: Api::V1::NotificationSerializer.new(@notification).as_json }, status: :ok
  end

  def mark_all_read
    current_user.notifications.unread.update_all(read_at: Time.current)
    render json: { meta: { unread_count: 0 } }, status: :ok
  end

  private

  def set_notification
    @notification = current_user.notifications.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Notification not found"] }, status: :not_found
  end
end
