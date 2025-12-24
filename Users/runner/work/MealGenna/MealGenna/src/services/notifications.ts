
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus, LocalNotificationSchema, Schedule, DeliveredNotifications } from '@capacitor/local-notifications';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_status';

// 1. Register the device for push notifications
export const registerNotifications = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;

    let permStatus: PermissionStatus = await LocalNotifications.checkPermissions();

    if (permStatus.display === 'prompt') {
        permStatus = await LocalNotifications.requestPermissions();
    }

    if (permStatus.display !== 'granted') {
        console.log('User denied local notification permissions.');
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
        return false;
    }
    
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
    return true;
};

// 2. Schedule local notifications
export const scheduleDailyNotifications = async () => {
    if (Capacitor.getPlatform() === 'web') return;

    // Check if we already have permission without prompting again
    const permission = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
    if (permission !== 'granted') {
        return;
    }
    
    try {
        // Clear any previously scheduled notifications to avoid duplicates
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
           await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        // Schedule new notifications
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 1, // Breakfast
                    title: "🍳 Good Morning!",
                    body: "Time for breakfast! Open MealGenna to find a delicious recipe.",
                    schedule: { on: { hour: 8, minute: 0 }, repeats: true },
                    smallIcon: 'ic_stat_icon_config_sample',
                    largeIcon: 'ic_launcher_foreground'
                },
                {
                    id: 2, // Lunch
                    title: "🥗 Lunch Time!",
                    body: "Feeling hungry? Let's find the perfect lunch idea in MealGenna.",
                    schedule: { on: { hour: 12, minute: 30 }, repeats: true },
                    smallIcon: 'ic_stat_icon_config_sample',
                    largeIcon: 'ic_launcher_foreground'
                },
                {
                    id: 3, // Dinner
                    title: "Dinner is Served!",
                    body: "What's for dinner tonight? Explore new and exciting meals with MealGenna.",
                    schedule: { on: { hour: 18, minute: 0 }, repeats: true },
                    smallIcon: 'ic_stat_icon_config_sample',
                    largeIcon: 'ic_launcher_foreground'
                }
            ]
        });
        console.log('Daily notifications scheduled successfully.');
    } catch(error) {
        console.error('Error scheduling notifications:', error);
    }
};

// --- OPTIONAL: Handle received notifications while app is open ---
LocalNotifications.addListener('localNotificationReceived', (notification: LocalNotificationSchema) => {
    console.log('Local notification received: ', notification);
    // You could show an in-app toast or alert here if you want
});
