
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesberry.mealgenna.pro',
  appName: 'MealGenna',
  webDir: 'public',
  server: {
    url: 'https://www.mealgenna.com', 
    cleartext: true
  },
  plugins: {}
};

export default config;
