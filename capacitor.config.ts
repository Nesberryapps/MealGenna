
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesberry.mealgenna.pro',
  appName: 'MealGenna',
  webDir: 'public',
  server: {
    url: 'https://www.mealgenna.com', 
    cleartext: true
  },
  plugins: {
    // Firebase Analytics and other plugins are configured here now
  },
  // This is the key change for the iOS build
  ios: {
    packageClassList: [
      'AdMobPlugin',
      'FirebaseAnalyticsPlugin',
      'FilesystemPlugin',
      'LocalNotificationsPlugin',
      'PushNotificationsPlugin',
      'PurchasesPlugin' // Correct name for the latest SDK
    ]
  }
};

export default config;
