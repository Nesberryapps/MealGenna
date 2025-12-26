
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
  ios: {
      // ✅ Keep this empty or add valid options like 'scheme' or 'contentInset'
      // usually you don't need anything here for standard plugins.
    }
  };

export default config;
