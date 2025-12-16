import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PermissionStatus, PushNotificationSchema } from '@capacitor/push-notifications';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_status';

// 1. Register the device for push notifications
export const registerNotifications = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;

    let permStatus: PermissionStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        // If permission is denied, maybe alert the user that they won't get notifications
        console.log('User denied push notification permissions.');
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
        return false;
    }
    
    // This part is for remote push notifications via services like FCM.
    // For local notifications, we don't need to register with a server.
    // await PushNotifications.register();
    
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
        const pending = await PushNotifications.getDeliveredNotifications();
        if (pending.notifications.length > 0) {
            await PushNotifications.removeAllDeliveredNotifications();
        }
        await PushNotifications.cancel({
            notifications: (await PushNotifications.getPending()).notifications,
        });

        // Schedule new notifications
        await PushNotifications.schedule({
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
PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('Push notification received: ', notification);
    // You could show an in-app toast or alert here if you want
});
