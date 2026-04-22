import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// User's custom Vite configuration
export default defineConfig({
  base: process.env.COSMIC_MOUNT_PATH || process.env.VITE_BASE_PATH || '',
  plugins: [vue()],
  define: {
    'import.meta.env.APP_PUBLIC_API_PATH': JSON.stringify(process.env.APP_PUBLIC_API_PATH || '')
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
  },
});
