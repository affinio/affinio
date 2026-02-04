<script setup lang="ts">
import AppHeader from "@/layouts/AppHeader.vue"
import AppFooter from "@/layouts/AppFooter.vue"
import OverlayStackPanel from "@/components/OverlayStackPanel.vue"
</script>

<template>
  <div class="app-shell">
    <AppHeader class="app-shell__header" />
    <main class="app-shell__main">
      <div class="app-shell__content">
        <router-view />
      </div>
    </main>
    <AppFooter class="app-shell__footer" />
    <OverlayStackPanel />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-shell__header,
.app-shell__footer {
  flex-shrink: 0;
}

.app-shell__main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-shell__content {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

@media (min-width: 1024px) {
  .app-shell__content {
    padding: 1.5rem 2rem 3rem;
  }
}
</style>
