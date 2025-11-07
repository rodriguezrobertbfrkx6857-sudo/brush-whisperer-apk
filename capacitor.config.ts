import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1ed35ccdb61d4065bea4a099230473ed',
  appName: 'AI图片生成器',
  webDir: 'dist',
  server: {
    url: 'https://1ed35ccd-b61d-4065-bea4-a099230473ed.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
