<script setup lang="ts">
import ThemeToggle from "@/components/ThemeToggle.vue"

</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <p class="app-footer__copy">
        © 2025 Affino. Built with ❤️ using Vue.js and TypeScript.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--glass-border);
  padding: 1.5rem 1rem;
}

.app-footer__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.app-footer__copy {
  font-size: 0.95rem;
  color: var(--text-muted);
}
</style>
