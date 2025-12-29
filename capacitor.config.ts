import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesberry.mealgenna.pro', // <--- MAKE SURE THIS MATCHES YOUR LIVE ID
  appName: 'MealGenna',
  webDir: 'public', // <--- This points to the dummy file folder
  server: {
    url: 'https://www.mealgenna.com', // <--- This is your Live Website
    cleartext: true
  }
};

export default config;