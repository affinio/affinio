<script setup lang="ts">
import { RouterLink } from "vue-router"
import { computed } from "vue"
import { useRoute } from "vue-router"
import AppHeader from "@/layouts/AppHeader.vue"

const route = useRoute()

const navigation = [
    { label: "Overview", description: "Product vision", to: "/" },
    { label: "Menu Studio", description: "Interactive demos", to: "/menu/simple" },
]

const isActive = (path: string) => {
    if (path === "/") {
        return route.path === "/"
    }
    return route.path.startsWith("/menu")
}

const marqueeCopy = computed(() =>
    route.path.startsWith("/menu") ? "Intent aware menus" : "Headless UI primitives"
)
</script>

<template>
    <div class="app-shell min-h-screen pb-16">
        <AppHeader :tagline="marqueeCopy" />
        <div
            class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-12 pt-6 lg:flex-row lg:items-start lg:px-8"
        >
            <aside class="shell-surface w-full rounded-3xl lg:w-64">
                <div class="flex flex-col gap-6 p-6">
                    <div>
                        <p class="text-[0.65rem] uppercase tracking-[0.35em] text-(--text-muted)">Components</p>
                        <p class="mt-2 text-lg font-semibold text-(--text-primary)">Affino Surface</p>
                    </div>
                    <nav class="flex flex-col gap-2">
                        <RouterLink
                            v-for="item in navigation"
                            :key="item.to"
                            :to="item.to"
                            class="group rounded-2xl border px-4 py-3 transition"
                            :class="[
                                isActive(item.to)
                                    ? 'border-transparent bg-linear-to-r from-(--accent)] to-(--accent-strong)] text-[#05060a] shadow-2xl'
                                    : 'border-(--glass-border)] text-(--text-muted)] hover:border-(--glass-highlight)] hover:text-(--text-primary)]',
                            ]"
                        >
                            <p class="text-sm font-semibold">{{ item.label }}</p>
                            <p v-if="item.description" class="text-xs opacity-80">{{ item.description }}</p>
                        </RouterLink>
                    </nav>
                    <div class="rounded-2xl border border-dashed border-(--glass-border)] p-4 text-xs text-(--text-muted)]">
                        Built with @affino/menu-core and Vue 3. Pointer intent, focus safety, and controller APIs in one place.
                    </div>
                </div>
            </aside>
            <main class="w-full flex-1">
                <router-view />
            </main>
        </div>
    </div>
</template>
