import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `npm run dev:mobile` serves over HTTPS on your LAN so phones can grant
// camera access for the virtual try-on (browsers require a secure context).
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'https' ? [basicSsl()] : [])],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three';
          if (id.includes('@mediapipe')) return 'mediapipe';
        },
      },
    },
  },
}));
