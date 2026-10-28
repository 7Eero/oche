import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oche.app',
  appName: 'Oche',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
