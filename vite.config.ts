import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import nodePolyfills from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['crypto'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'crypto': 'crypto-browserify',
    },
  },
  define: {
    'process.env': {},
    'global': {},
  },
})