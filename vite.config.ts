import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['axios', 'date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://mymedspharmacyinc.com/api'
        : 'http://localhost:4000'
    ),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
      mode === 'production'
        ? 'https://mymedspharmacyinc.com/api'
        : 'http://localhost:4000'
    ),
    'import.meta.env.VITE_WORDPRESS_URL': JSON.stringify(
      mode === 'production'
        ? 'https://mymedspharmacyinc.com/blog'
        : 'http://localhost:3000/blog'
    )
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}))
