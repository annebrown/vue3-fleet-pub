<template>
  <nav>
    <ul :class="{'ml-4': indent}" class="list-none p-0 text-green-500">
      <li v-for="(link, index) in links" :key="link.to || link.label || index" class="m-0 p-0 text-green-600">
        <template v-if="link.children && link.children.length > 0">
         <div class="flex items-center space-x-2 cursor-pointer py-1 mt-1" @click="toggleCollapse(link)">
    <span class="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        <span :class="{'rotate-90': !isCollapsed(link), 'text-purple-700 text-sm font-medium': true, 'transition-transform duration-200': true}">
            ▶
        </span>
    </span>
    <span class="text-sm font-medium text-purple-700 hover:text-blue-500">{{ link.label }}</span>
</div>

<a :href="link.to" class="block text-sm font-medium text-purple-700 hover:text-blue-500 py-1 pl-6">
    {{ link.label }}
</a>
          <Transition name="fade-slide">
            <NaviTree
              v-if="!isCollapsed(link)"
              :links="link.children"
              :indent="true"
              class="mt-1"
            />
          </Transition>
        </template>
        <template v-else>
          <a :href="link.to" class="block hover:text-blue-600 py-1 ml-6">
            {{ link.label }}
          </a>
        </template>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface NavigationLink {
  label: string;
  to?: string; // Optional target path/URL
  children?: NavigationLink[]; // Nested items
  collapsible?: boolean;
}

const props = defineProps<{
  links: NavigationLink[]; // The array of navigation data
  indent?: boolean; // Used for recursive calls to add left margin
}>();

// Reactive map to store the collapse state of each parent link
const collapseState = ref<Map<string, boolean>>(new Map());

/**
 * Checks if a specific link (identified by its path or label) is currently collapsed.
 * Defaults to `false` (expanded) if no state is found, ensuring sections are open by default.
 */
const isCollapsed = (link: NavigationLink) => {
  const key = link.to || link.label; // Use `to` (if present) or `label` as a unique identifier for state
  return key ? collapseState.value.get(key) ?? false : false; // Default to not collapsed
};

/**
 * Toggles the collapse state of a specific link.
 */
const toggleCollapse = (link: NavigationLink) => {
  const key = link.to || link.label;
  if (key) {
    collapseState.value.set(key, !isCollapsed(link));
  }
};
</script>

<style scoped>
/* Transition for expanding/collapsing sections */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  max-height: 500px; /* Adjust as needed for maximum possible height of a collapsed section */
  transform: translateY(0);
}

/* Essential styles that were missing due to Tailwind not scanning module's source */
.list-none { list-style: none; }
.p-0 { padding: 0; }
.ml-4 { margin-left: 1rem; } /* For nested UL indentation */
.ml-6 { margin-left: 1.5rem; } /* For leaf node indentation */
.flex { display: flex; }
.items-center { align-items: center; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
.cursor-pointer { cursor: pointer; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.mt-1 { margin-top: 0.25rem; }
.block { display: block; }


</style>