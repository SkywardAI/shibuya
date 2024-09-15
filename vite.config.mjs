import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [ 
    react(),
    {
      // to enable SharedArrayBuffer
      name: 'isolation',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');

          next();
        });
      }
    }
  ],
  server: {
    port: 3000
  }
})
