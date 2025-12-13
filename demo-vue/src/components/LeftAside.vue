<template>
  <aside class="w-full lg:w-64">
    <div class="flex flex-col gap-6">
      <nav class="flex flex-col gap-2">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="py-3 transition"
          :class="[
            isActive(item.to)
              ? 'border-transparent bg-linear-to-r from-(--accent)] to-(--accent-strong)] text-[#05060a] shadow-2xl'
              : 'border-(--glass-border)] text-(--text-muted)] hover:border-(--glass-highlight)] hover:text-(--text-primary)]',
          ]"
        >
          <p class="text-sm font-semibold">{{ item.label }}</p>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()

const navigation = [
  { label: 'Overview', to: '/' },
  { label: 'Menu', to: '/menu/simple' },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith('/menu')
}
</script>
