// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ //
      include: ['src/**/*.ts', 'src/**/*.vue']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'Vue3FleetPub',
      fileName: (format) => `vue3-fleet-pub.${format}.js`
    },
    rollupOptions: {
      external: ['vue'], // Don't bundle with lib
      output: {
        // Global vars for viewport-visible externalized deps
        globals: {
          vue: 'Vue',
        },
        exports: 'named'
      }
    }
  }
})
