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
  baseRoutePrefix?: string; // e.g., '/', '/admin', '/blog'
  initialExpansionLevel?: number;
}>();

const router = useRouter();
const pageNavigationLinks = ref<NavigationLink[]>([]);

// --- Helper for building route-based tree ---
// Parse Nuxt route records into hierarchical NavigationLink structure.
const buildRouteNavigationTree = (
  routes: ReturnType<typeof router.getRoutes>, // An array of Nuxt route records
  basePrefix: string
): NavigationLink[] => {
  const treeMap = new Map<string, NavigationLink>();
  const rootNodes: NavigationLink[] = [];

  // Normalize basePrefix to ensure consistent path handling
  const normalizedBasePrefix = basePrefix.endsWith('/') ? basePrefix.slice(0, -1) : basePrefix;

  // First Pass: Create all individual nodes (pages and implicit directories)
  routes.forEach(route => {
    // Filter routes to only include those under the basePrefix
    if (!route.path.startsWith(normalizedBasePrefix)) {
      return;
    }

    // Exclude dynamic segments for tree building labels (e.g., /users/:id -> /users)
    const cleanPath = route.path.split('/:')[0];
    // Exclude catch-all routes if missing title
    if (cleanPath.includes('...')) {
        // Rely on meta.title for all pages.
    }

    const label = route.meta?.title as string || cleanPath.split('/').pop() || 'Untitled Page';
    const isLeaf = !route.children || route.children.length === 0; 

    // Create or update node for the current route's cleanPath
    let currentNode: NavigationLink;
    if (treeMap.has(cleanPath)) {
        currentNode = treeMap.get(cleanPath)!;
    } else {
        currentNode = {
            label: label,
            to: cleanPath,
            children: [],
            collapsible: !isLeaf // Default to collapsible if not leaf
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


  // Second Pass: Assemble the hierarchy
  treeMap.forEach(node => {
    const fullPath = node.to || node.label; // Use 'to' for path, fallback to label

    const lastSlashIndex = fullPath.lastIndexOf('/');
    const parentPath = lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex) : '';

    if (parentPath === normalizedBasePrefix) {
      // This is a direct child of the base prefix (e.g., /docs/arch for /docs)
      rootNodes.push(node);
    } else if (treeMap.has(parentPath)) {
      // This node has a parent in our map, add it as a child
      const parentNode = treeMap.get(parentPath)!;
      parentNode.children = parentNode.children || [];
      if (!parentNode.children.some(child => child.to === node.to)) { // Avoid duplicates
        parentNode.children.push(node);
      }
      parentNode.collapsible = true; // Mark parent as collapsible
    } else if (fullPath === normalizedBasePrefix && normalizedBasePrefix !== '/') {
        // Handle the basePrefix route itself if it's not the absolute root '/'
        // This node defines the starting point of the tree. It will be filtered later if not needed.
        rootNodes.push(node);
    } else if (normalizedBasePrefix === '/' && parentPath === '') {
        // For the absolute root path, direct children without explicit parent are top-level.
        rootNodes.push(node);
    }
  });

  // Filter out the basePrefix node itself if it was added as a root node,
  // unless basePrefix is '/' and you want to show all top-level pages.
  const finalRootNodes = rootNodes.filter(node => {
      // Keep nodes that are not the basePrefix itself (unless basePrefix is '/' and it's a top-level page)
      return node.to !== normalizedBasePrefix || normalizedBasePrefix === '/';
  });

  // Sort the final tree (directories first, then files alphabetically)
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


// --- Fetching and Building Navigation ---
const buildPageNavigation = async () => {
  const allRoutes = router.getRoutes(); // Get all route records
  
  const filteredRoutes = allRoutes.filter(route => {
    // Filter out routes that are not pages (e.g., named routes for modals, etc.)
    // and those that don't have meta.title or path.
    // Ensure route.path starts with the baseRoutePrefix.
    return route.meta?.title && route.path.startsWith(props.baseRoutePrefix || '/');
  });

  // Build the hierarchical navigation tree from the filtered routes
  pageNavigationLinks.value = buildRouteNavigationTree(filteredRoutes, props.baseRoutePrefix || '/');
};

onMounted(buildPageNavigation);
// Watch for changes in baseRoutePrefix or routes (if dynamic routes are added/removed)
watch(() => props.baseRoutePrefix, buildPageNavigation);
watch(() => router.getRoutes().length, buildPageNavigation); // Simple watch for route changes
</script>

<style scoped>
/* Add any PagesNaviTree specific styles here if needed */
</style>