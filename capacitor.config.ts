import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesberry.mealgenna.pro',
  appName: 'MealGenna',
  webDir: 'out',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // Replace with your App ID
      autoShow: false,
    },
  },
};

export default config;
