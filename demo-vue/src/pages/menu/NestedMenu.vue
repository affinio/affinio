<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-vue"
import ReactMount from "@/components/ReactMount.vue"
import { useFrameworkStore } from "@/stores/framework"
import NestedMenuDemo from "@/react-demos/NestedMenuDemo"
import { createHighlighter } from "shiki"

const stacks = [
  {
    label: "Analytics",
    code: "AN",
    note: "Funnels, retention, pulse",
    items: ["Sessions", "Funnel analysis", "Cohort compare", "Pulse alerts"],
  },
  {
    label: "Automation",
    code: "AU",
    note: "Playbooks and jobs",
    items: ["Create schedule", "Sync segments", "Trigger webhooks"],
  },
  {
    label: "Access",
    code: "AC",
    note: "Teams, roles, audit",
    items: ["Invite teammate", "Promote to admin", "Transfer ownership"],
  },
]

const lastSelection = ref("Waiting for highlight")

function handleSelect(label: string) {
  lastSelection.value = label
}

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const usingVue = computed(() => current.value === "vue")

const highlighted = ref("")

const source = `import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiSubMenu,
  UiSubMenuTrigger,
  UiSubMenuContent,
} from "@affino/menu-vue"

const stacks = [
  { label: "Analytics", items: ["Sessions", "Funnels"] },
  { label: "Automation", items: ["Sync segments"] },
]

<UiMenu :options="{ openDelay: 80, closeDelay: 150 }">
  <UiMenuTrigger as-child>
    <button class="menu-demo-trigger">Open stacks</button>
  </UiMenuTrigger>
  <UiMenuContent>
    <UiSubMenu v-for="stack in stacks" :key="stack.label">
      <UiSubMenuTrigger>{{ stack.label }}</UiSubMenuTrigger>
      <UiSubMenuContent>
        <UiMenuItem
          v-for="item in stack.items"
          :key="item"
          @select="() => console.log(item)"
        >
          {{ item }}
        </UiMenuItem>
      </UiSubMenuContent>
    </UiSubMenu>
  </UiMenuContent>
</UiMenu>
`

onMounted(async () => {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: ["vue"],
  })

  highlighted.value = highlighter.codeToHtml(source, {
    lang: "vue",
    theme: "github-dark",
  })
})
</script>

<template>
  <section class="menu-demo-block">
    <div class="menu-demo-description">
      <p class="menu-demo-eyebrow">Nested flow</p>
      <h3 class="menu-demo-title">Diagonal prediction keeps deep submenus responsive.</h3>
      <p class="menu-demo-text">
        Each <code>UiSubMenu</code> shares the same tree so hover intent and keyboard focus stay coordinated across
        levels. Slightly longer close delays make automation browsing calmer.
      </p>
    </div>

    <div class="demo-workspace">
      <template v-if="usingVue">
        <div class="menu-demo-surface flex flex-col gap-6 text-left">
          <UiMenu :options="{ openDelay: 60, closeDelay: 140 }">
            <UiMenuTrigger as-child>
              <button class="menu-demo-trigger">Browse stacks</button>
            </UiMenuTrigger>
            <UiMenuContent class="menu-playground-panel">
              <UiMenuLabel>Stacks</UiMenuLabel>
              <UiMenuSeparator />
              <UiSubMenu v-for="stack in stacks" :key="stack.label">
                <UiSubMenuTrigger>
                  <div class="flex flex-1 items-center gap-3 text-left">
                    <span class="stack-code-pill">{{ stack.code }}</span>
                    <div class="flex flex-col">
                      <span class="text-sm font-semibold">{{ stack.label }}</span>
                      <span class="text-xs text-(--ui-menu-muted)">{{ stack.note }}</span>
                    </div>
                  </div>
                </UiSubMenuTrigger>
                <UiSubMenuContent class="menu-playground-panel">
                  <UiMenuItem
                    v-for="item in stack.items"
                    :key="item"
                    @select="() => handleSelect(item)"
                  >
                    <span class="text-sm font-semibold">{{ item }}</span>
                    <span class="text-xs text-(--ui-menu-muted)">Enter</span>
                  </UiMenuItem>
                </UiSubMenuContent>
              </UiSubMenu>
            </UiMenuContent>
          </UiMenu>
        </div>
      </template>
      <ReactMount v-else :component="NestedMenuDemo" :key="current" />
      <div class="demo-last-action">
        <span class="demo-last-action__label">Last action</span>
        <span class="demo-last-action__value">{{ lastSelection }}</span>
      </div>
    </div>

    <pre class="demo-code">
<code>
  <code v-html="highlighted" />
</code>
</pre>
  </section>
</template>
