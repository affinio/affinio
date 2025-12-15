<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useFrameworkStore, type Framework } from "@/stores/framework"

const store = useFrameworkStore()
const { current } = storeToRefs(store)

const frameworks: Array<{ label: string; pill: string; value: Framework }> = [
  { label: "Vue 3", pill: "@affino/menu-vue", value: "vue" },
  { label: "React 18", pill: "@affino/menu-react", value: "react" },
]

function selectFramework(value: Framework) {
  store.setFramework(value)
}
</script>

<template>
  <div class="framework-toggle" role="group" aria-label="Select framework for demos">
    <button
      v-for="entry in frameworks"
      :key="entry.value"
      type="button"
      class="framework-toggle__option"
      :class="{ 'is-active': current === entry.value }"
      :aria-pressed="current === entry.value"
      @click="selectFramework(entry.value)"
    >
      <span>{{ entry.label }}</span>
      <span class="framework-toggle__pill">{{ entry.pill }}</span>
    </button>
  </div>
</template>
