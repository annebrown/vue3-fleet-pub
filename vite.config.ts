// /home/anne/devy/modules/vue3-fleet-pub/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({ insertTypesEntry: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue3FleetPub',
      // THIS IS THE CRITICAL PART FOR FILENAMES
      fileName: (format) => {
        if (format === 'es') return 'vue3-fleet-pub.mjs'; // For ES Modules
        if (format === 'cjs') return 'vue3-fleet-pub.cjs'; // For CommonJS
        if (format === 'umd') return 'vue3-fleet-pub.umd.cjs'; // For UMD
        return `vue3-fleet-pub.${format}.js`; // Fallback
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
});