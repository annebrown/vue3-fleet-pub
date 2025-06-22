<!-- @/src/components/navi/PagesNaviTree.vue -->
 <template>
  <div class="px-2">
    <nav>
      <NaviTree
        :links="pageNavigationLinks"
        ulClasses="ml-4 list-none p-0 text-green-500"
        liClasses="m-0 p-0 text-green-600"
        ulChildrenClasses="ml-4 list-none p-0 text-green-500"
        :depth="0"
        :initialExpansionLevel="props.initialExpansionLevel"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; 
import NaviTree from './NaviTree.vue'; 

interface NavigationLink {
  label: string;
  to?: string;
  children?: NavigationLink[];
  collapsible?: boolean;
}

const props = defineProps<{
  baseRoutePrefix?: string; 
  initialExpansionLevel?: number;
}>();

const router = useRouter();
const pageNavigationLinks = ref<NavigationLink[]>([]);

const buildRouteNavigationTree = (
  routes: ReturnType<typeof router.getRoutes>, 
  basePrefix: string
): NavigationLink[] => {
  const treeMap = new Map<string, NavigationLink>();
  const rootNodes: NavigationLink[] = [];
  const normalizedBasePrefix = basePrefix.endsWith('/') ? basePrefix.slice(0, -1) : basePrefix;

  // First Pass: Create all nodes
  routes.forEach(route => {
    if (!route.path.startsWith(normalizedBasePrefix)) {
      return;
    }

    // Exclude dynamic segments
    const cleanPath = route.path.split('/:')[0];
    // Exclude catch-all routes if missing title
    if (cleanPath.includes('...')) {
        // Rely on meta.title for all pages.
    }

    const label = route.meta?.title as string || cleanPath.split('/').pop() || 'Untitled Page';
    const isLeaf = !route.children || route.children.length === 0; 

    let currentNode: NavigationLink;
    if (treeMap.has(cleanPath)) {
        currentNode = treeMap.get(cleanPath)!;
    } else {
        currentNode = {
            label: label,
            to: cleanPath,
            children: [],
            collapsible: !isLeaf 
        };
        treeMap.set(cleanPath, currentNode);
    }
    
    if (isLeaf) {
        currentNode.children = undefined;
        currentNode.collapsible = false;
        currentNode.to = route.path; 
    } else {
        currentNode.collapsible = true;
        currentNode.to = route.path;
    }
  });


  // Second Pass: Assemble hierarchy
  treeMap.forEach(node => {
    const fullPath = node.to || node.label; 

    const lastSlashIndex = fullPath.lastIndexOf('/');
    const parentPath = lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex) : '';

    if (parentPath === normalizedBasePrefix) {
      // Child of apex
      rootNodes.push(node);
    } else if (treeMap.has(parentPath)) {
      const parentNode = treeMap.get(parentPath)!;
      parentNode.children = parentNode.children || [];
      if (!parentNode.children.some(child => child.to === node.to)) { // Avoid dups
        parentNode.children.push(node);
      }
      parentNode.collapsible = true; 
    } else if (fullPath === normalizedBasePrefix && normalizedBasePrefix !== '/') {
        rootNodes.push(node);
    } else if (normalizedBasePrefix === '/' && parentPath === '') {
        rootNodes.push(node);
    }
  });

  const finalRootNodes = rootNodes.filter(node => {
      return node.to !== normalizedBasePrefix || normalizedBasePrefix === '/';
  });

  // Sort dirs first
  const sortNodes = (nodes: NavigationLink[]) => {
    nodes.sort((a, b) => {
      const isADir = a.children && a.children.length > 0;
      const isBDir = b.children && b.children.length > 0;
      if (isADir && !isBDir) return -1;
      if (!isADir && isBDir) return 1;
      return (a.label || '').localeCompare(b.label || '');
    });
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };
  sortNodes(finalRootNodes);

  return finalRootNodes;
};


const buildPageNavigation = async () => {
  const allRoutes = router.getRoutes(); 
  
  const filteredRoutes = allRoutes.filter(route => {
    return route.meta?.title && route.path.startsWith(props.baseRoutePrefix || '/');
  });

  pageNavigationLinks.value = buildRouteNavigationTree(filteredRoutes, props.baseRoutePrefix || '/');
};

onMounted(buildPageNavigation);
watch(() => props.baseRoutePrefix, buildPageNavigation);
watch(() => router.getRoutes().length, buildPageNavigation); /
</script>