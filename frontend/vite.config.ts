import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5173',
      '/ws': {
        target: 'ws://localhost:3005',
        ws: true,
      },
    },
  },
});
