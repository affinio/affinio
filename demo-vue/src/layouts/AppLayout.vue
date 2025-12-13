<script setup lang="ts">
import AppHeader from '@/layouts/AppHeader.vue'
import AppFooter from '@/layouts/AppFooter.vue'
import AppAside from '@/components/LeftAside.vue'
</script>

<template>
  <div class="app-shell min-h-screen">
    <AppHeader />
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-12 pt-6 lg:flex-row lg:items-start lg:px-8"
    >
      <div class="flex w-full gap-8 lg:flex-row">
        <AppAside />
        <main class="w-full flex-1">
          <router-view />
        </main>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
