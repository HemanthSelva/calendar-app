// src/utils/notifications.js

// Ask the user for notification permission
export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  }
};

// Show the actual event reminder
export const sendEventReminder = (event) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification("📅 Event Reminder", {
      body: `${event.title} at ${event.time} on ${event.date}`,
      icon: "/favicon.ico", // Optional icon for the notification
    });

    // Auto-close notification after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
};

// Schedule notifications for events within the next 5 minutes
export const scheduleEventReminders = (events) => {
  if (!("Notification" in window)) return;

  requestNotificationPermission();

  const now = new Date();

  events.forEach((event) => {
    const eventTime = new Date(`${event.date}T${event.time}`);
    const timeDiff = eventTime.getTime() - now.getTime();

    // If the event is 5 minutes from now or sooner, schedule a notification
    if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) {
      setTimeout(() => sendEventReminder(event), timeDiff);
    }
  });
};
