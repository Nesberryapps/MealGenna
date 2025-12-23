
import { Capacitor } from '@capacitor/core';

// All LocalNotifications functionality has been temporarily disabled for the iOS build.

// 1. Register the device for push notifications
export const registerNotifications = async (): Promise<boolean> => {
    if (Capacitor.getPlatform() === 'web') return false;
    console.log("Local Notifications disabled for this build.");
    return false;
};

// 2. Schedule local notifications
export const scheduleDailyNotifications = async () => {
    if (Capacitor.getPlatform() === 'web') return;
    console.log("Local Notifications disabled for this build.");
};
