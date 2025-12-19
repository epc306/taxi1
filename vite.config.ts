import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages repository name: 'taxi1'
  // This ensures assets are loaded from /taxi1/assets/ instead of /assets/
  base: '/taxi1/',
});