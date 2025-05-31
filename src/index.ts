// src/index.ts
import type { App } from 'vue';
import StarterTest from './components/StarterTest.vue';
// Export individual components
export { StarterTest };

// Export a plugin for global registration (Good Practice)
export default {
  install(app: App) {
    app.component('StarterTest', StarterTest);
  }
};
