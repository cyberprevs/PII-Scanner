import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      checks: {
        // @microsoft/signalr ships a /*#__PURE__*/ annotation Rolldown can't
        // place; it's harmless (no dead-code-elimination impact) so silence it.
        invalidAnnotation: false,
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules\/(react|react-dom|react-router-dom)\// },
            { name: 'vendor-mui', test: /node_modules\/(@mui|@emotion)\// },
            { name: 'vendor-recharts', test: /node_modules\/recharts\// },
            { name: 'vendor-signalr', test: /node_modules\/@microsoft\/signalr\// },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
});
