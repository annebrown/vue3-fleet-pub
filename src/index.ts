// src/index.ts
import type { App } from 'vue';
import StarterTest from './components/StarterTest.vue';
import NaviTree from './components/ui/NaviTree.vue'; 

// Export individual components
export { StarterTest,  NaviTree };

// Export a plugin for global registration (Good Practice)
export default {
  install(app: App) {
    app.component('StarterTest', StarterTest);
    app.component('NaviTree', NaviTree);
  }
};
