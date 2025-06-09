<!-- /@src/components/navi/NaviTree.vue -->
<template>
  <ul :class="ulClasses">
    <li v-for="link in links" :key="link.to || link.label" :class="liClasses">
      <div
        class="flex items-center space-x-2 mt-0 py-0"
      >
        <span
          v-if="link.children && link.children.length > 0"
          @click="toggleCollapse(link)"
          class="flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer mr-1"
        >
          <span
            class="text-purple-700 text-sm font-medium transition-transform duration-200"
            :class="{ 'rotate-90': !isCollapsed(link) }"
          >
            ▶
          </span>
        </span>&nbsp;<a
          :href="link.to"
          class="block text-sm font-medium text-purple-700 hover:text-blue-500 py-0"
          :class="{
            'ml-6': isLeafNode(link),
            'flex-grow': link.children && link.children.length > 0
          }"
        >
          {{ link.label }}
        </a>
      </div>

      <nav v-if="link.children && link.children.length > 0 && !isCollapsed(link)" class="mt-0">
        <NaviTree
          :links="link.children"
          :ulClasses="props.ulChildrenClasses"       :liClasses="liClasses"
          :depth="currentDepth + 1"
          :initialExpansionLevel="initialExpansionLevel"
          :ulChildrenClasses="props.ulChildrenClasses" />
      </nav>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';

interface NavigationLink {
  label: string;
  to?: string;
  children?: NavigationLink[];
  collapsible?: boolean;
}

const props = defineProps<{
  links: NavigationLink[];
  ulClasses?: string;
  liClasses?: string;
  ulChildrenClasses?: string; // Passed down recursively
  depth?: number;
  initialExpansionLevel?: number;
}>();

const currentDepth = computed(() => props.depth ?? 0);

// console.log(`NaviTree instance rendered:
//   Depth: ${currentDepth.value}
//   Links length: ${props.links.length}
//   ulClasses prop received: '${props.ulClasses}'
//   ulChildrenClasses prop received: '${props.ulChildrenClasses}'
// `);

const collapsedState = ref<{ [key: string]: boolean }>({});

const isLeafNode = (link: NavigationLink): boolean => {
  return !link.children || link.children.length === 0;
};

const initializeCollapseState = (links: NavigationLink[], level: number) => {
  links.forEach(link => {
    // Only process if it's a directory (has children, a 'to' link, AND has actual children to expand)
    if (link.children && link.children.length > 0 && link.to) {
      if (!(link.to in collapsedState.value)) {
        const shouldBeExpanded = props.initialExpansionLevel !== undefined && level < props.initialExpansionLevel;
        collapsedState.value[link.to] = !shouldBeExpanded;
      }
      initializeCollapseState(link.children, level + 1);
    }
  });
};

onMounted(() => {
  initializeCollapseState(props.links, currentDepth.value);
});

watch(
  () => props.links,
  newLinks => {
    collapsedState.value = {};
    initializeCollapseState(newLinks, currentDepth.value);
  },
  { deep: true }
);

watch(
  () => props.initialExpansionLevel,
  () => {
    collapsedState.value = {};
    initializeCollapseState(props.links, currentDepth.value);
  }
);

const isCollapsed = (link: NavigationLink): boolean => {
  if (!link.to || !link.children || link.children.length === 0) return false;
  return !!collapsedState.value[link.to];
};

const toggleCollapse = (link: NavigationLink) => {
  if (link.to) {
    collapsedState.value[link.to] = !collapsedState.value[link.to];
  }
};
</script>