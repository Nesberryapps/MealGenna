
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesberry.mealgenna.pro',
  appName: 'MealGenna',
  webDir: 'out',
  server: {
    // This is required for Android to handle routing correctly.
    // It tells Capacitor that the app is a single-page application
    // and that it should handle routing internally.
    // For iOS, this is handled automatically.
    // You may need to configure this differently if you are not using a single-page app architecture.
    // For more info, see: https://capacitorjs.com/docs/guides/deep-links#single-page-applications-spa
    // This setting is also useful for Next.js apps that are exported as static sites.
    // The `hostname` setting is useful for local development with live reload.
    // For production builds, you may want to remove the hostname or set it to your app's domain.
    // For more info, see: https://capacitorjs.com/docs/config
    // In this case, we are using a static export, so we can use the following configuration:
    androidScheme: 'https',
  }
};

export default config;
