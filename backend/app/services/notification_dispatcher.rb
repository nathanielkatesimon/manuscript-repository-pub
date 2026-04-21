class NotificationDispatcher
  def self.notify(user:, message:, notification_type:, metadata: {})
    return unless user

    notification = user.notifications.create(
      message: message,
      notification_type: notification_type,
      metadata: metadata
    )
    return unless notification.persisted?

    NotificationsChannel.broadcast_to(user, {
      event: "notification.created",
      data: Api::V1::NotificationSerializer.new(notification).as_json
    })

    notification
  end
end
