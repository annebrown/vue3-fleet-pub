// vue3-fleet-pub/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// REMOVED: import tailwindcss from '@tailwindcss/vite'; // No longer needed here

export default defineConfig({
  plugins: [
    vue(),
    // REMOVED: tailwindcss(), // No longer needed here
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Vue3FleetPub',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'cjs') return 'index.cjs';
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      external: ['vue', 'vue-router', '@nuxt/content'], 
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          '@nuxt/content': 'NuxtContent', 
        },
      },
    },
  },
});