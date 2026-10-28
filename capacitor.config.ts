import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartstracker.app',
  appName: 'Darts Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
