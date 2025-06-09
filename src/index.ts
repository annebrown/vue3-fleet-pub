// src/index.ts
import type { App } from 'vue';
import NaviTree from './components/navi/NaviTree.vue'; 
import SourceNaviTree from './components/navi/SourceNaviTree.vue'; 
import PagesNaviTree from './components/navi/PagesNaviTree.vue'; 

// Export individual components
export { NaviTree, SourceNaviTree, PagesNaviTree };

// Export a plugin for global registration (Good Practice)
export default {
  install(app: App) {
    app.component('NaviTree', NaviTree);
    app.component('SourceNaviTree', SourceNaviTree);
    app.component('PagesNaviTree', PagesNaviTree);
  }
};
