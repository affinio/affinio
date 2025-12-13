<script setup lang="ts">
import AppHeader from "@/layouts/AppHeader.vue"
import AppFooter from "@/layouts/AppFooter.vue"
</script>

<template>
  <div class="app-shell flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1 w-full">
      <div class="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 lg:px-8">
        <router-view />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
