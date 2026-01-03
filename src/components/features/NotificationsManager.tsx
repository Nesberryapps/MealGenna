'use client';

import { useEffect } from 'react';

// Define the meal times and their corresponding notification details
const mealTimes = [
  { name: 'Breakfast', hour: 8, minute: 0, title: "🍳 It's Breakfast Time!", body: "Time to start your day with a delicious meal. What are you making?" },
  { name: 'Lunch', hour: 12, minute: 0, title: "🥗 Lunch is Ready!", body: "Take a break and enjoy a midday meal. Got any ideas?" },
  { name: 'Dinner', hour: 18, minute: 0, title: "🍝 Dinner is Served!", body: "What's on the menu for tonight? Let's cook something great!" },
];

/**
 * A client-side component that runs in the background to manage
 * scheduling and displaying mealtime notifications.
 */
export function NotificationsManager() {
  useEffect(() => {
    // This component only runs on the client
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const areNotificationsGloballyEnabled = () => {
      return localStorage.getItem('mealgenna-notifications-enabled') === 'true';
    };

    const showNotification = (title: string, body: string) => {
      // Don't show if permission isn't granted or user has disabled them in-app
      if (Notification.permission !== 'granted' || !areNotificationsGloballyEnabled()) {
        return;
      }
      new Notification(title, {
        body,
        icon: '/logo.png', // Optional: Add a logo for notifications
      });
    };

    const scheduleNotifications = () => {
      const now = new Date();

      mealTimes.forEach(({ hour, minute, title, body }) => {
        const notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        let timeoutMs = notificationTime.getTime() - now.getTime();

        // If the time has already passed for today, schedule it for tomorrow
        if (timeoutMs < 0) {
          notificationTime.setDate(notificationTime.getDate() + 1);
          timeoutMs = notificationTime.getTime() - now.getTime();
        }

        setTimeout(() => {
          showNotification(title, body);
          // Reschedule for the next day after it fires
          setInterval(() => showNotification(title, body), 24 * 60 * 60 * 1000);
        }, timeoutMs);
      });
    };

    // Only schedule if user has opted in
    if (Notification.permission === 'granted' && areNotificationsGloballyEnabled()) {
      scheduleNotifications();
    }
    
    // The timeouts will be cleared when the browser session ends.
    // For a more robust implementation that survives browser restarts,
    // a Service Worker would be needed, but this approach is simpler
    // and works for the current session.

  }, []); // Run only once on component mount

  return null; // This component does not render anything
}
