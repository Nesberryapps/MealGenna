
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
  // Temporarily removed AdMob and Purchases for a clean iOS build
  ios: {
    packageClassList: [
      'FilesystemPlugin'
    ]
  }
};

export default config;
