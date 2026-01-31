<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from "vue"
import type { ComponentType } from "react"
import { createElement } from "react"
import { createRoot, type Root } from "react-dom/client"

interface ReactMountProps {
  component: ComponentType<Record<string, unknown>>
  props?: Record<string, unknown>
}

const props = defineProps<ReactMountProps>()
const containerRef = ref<HTMLElement | null>(null)
let root: Root | null = null

watchEffect(() => {
  if (!containerRef.value) return
  if (!root) {
    root = createRoot(containerRef.value)
  }
  root.render(createElement(props.component, props.props ?? {}))
})

onBeforeUnmount(() => {
  root?.unmount()
  root = null
})
</script>

<template>
  <div class="react-mount" ref="containerRef" v-bind="$attrs"></div>
</template>
