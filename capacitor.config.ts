
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
  },
  ios: {
    deploymentTarget: '15.0',
    scheme: 'MealGenna' 
  }
};

export default config;
// Force build update
