const Notification = require('../models/Notification');

/**
 * Helper to generate and store in-app notifications
 */
const createNotification = async ({
  recipient,
  sender = null,
  project = null,
  type = 'general',
  title,
  message,
  link = '',
}) => {
  try {
    if (!recipient) return null;

    // Avoid self-notification
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      project,
      type,
      title,
      message,
      link,
    });

    return notification;
  } catch (error) {
    console.error('[Notification Error] Could not create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
