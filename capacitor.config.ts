
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
    // Keep your existing plugins configuration here if any
  }
};

export default config;
