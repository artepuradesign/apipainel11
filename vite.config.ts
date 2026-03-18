import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configuração de proxy para redirecionamento de API
    proxy: {
      // Redireciona todas as chamadas que começam com /api para o backend
      '/api': {
        target: 'https://api.apipainel.com.br', // URL do seu backend
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Mantém o caminho original sem modificar
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-icon-192.png', 'pwa-icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'APIPainel',
        short_name: 'APIPainel',
        description: 'Soluções Digitais',
        theme_color: '#7c3aed',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Aumenta o limite para permitir precache de bundles maiores
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MiB
      },
    }),
  ].filter(Boolean),
  build: {
    chunkSizeWarningLimit: 12000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress mixed dynamic/static import warnings
        if (warning.code === 'PLUGIN_WARNING' && warning.message?.includes('dynamically imported by')) return;
        if (warning.plugin === 'vite:reporter' && warning.message?.includes('dynamically imported by')) return;
        warn(warning);
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
