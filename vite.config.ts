import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // MUI core + icons (largest dependency)
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Data / query
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js', 'zod', 'react-hook-form', '@hookform/resolvers'],
          // Charts
          'vendor-charts': ['recharts'],
          // PDF / image generation
          'vendor-pdf': ['jspdf', 'html-to-image'],
          // Date utils
          'vendor-dates': ['date-fns'],
          // Blockchain (only loaded on card-issuance page)
          'vendor-ethers': ['ethers'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // kB — reasonable for a data-heavy app
  },
})
