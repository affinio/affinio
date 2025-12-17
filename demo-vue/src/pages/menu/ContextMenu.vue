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
} from "@affino/menu-vue"
import ReactMount from "@/components/ReactMount.vue"
import { useFrameworkStore } from "@/stores/framework"
import ContextMenuDemo from "@/react-demos/ContextMenuDemo"
import { createHighlighter } from "shiki"

const canvasActions = [
  { label: "Create sticky", detail: "Drop a note at cursor" },
  { label: "Link block", detail: "Connect nodes with arrows" },
  { label: "Summon command palette", detail: "Open overlay", shortcut: "Ctrl+K" },
]

const destructiveActions = [
  { label: "Clear selection", detail: "Deselect everything" },
  { label: "Delete selection", detail: "Remove highlighted nodes", danger: true },
]

const logs = ref<string[]>([])

function pushLog(entry: string) {
  const stamp = new Date().toLocaleTimeString()
  logs.value = [`${entry} at ${stamp}`, ...logs.value].slice(0, 3)
}

const lastLog = computed(() => logs.value[0] ?? "Awaiting your gesture")

const frameworkStore = useFrameworkStore()
const { current } = storeToRefs(frameworkStore)
const usingVue = computed(() => current.value === "vue")

const highlighted = ref("")

const source = `import { ref } from "vue"
import {
  UiMenu,
  UiMenuTrigger,
  UiMenuContent,
  UiMenuItem,
  UiMenuLabel,
  UiMenuSeparator,
} from "@affino/menu-vue"

const logs = ref<string[]>([])

function log(label: string) {
  logs.value = [label, ...logs.value].slice(0, 3)
}

<UiMenu>
  <UiMenuTrigger as-child trigger="contextmenu">
    <button class="menu-demo-trigger">Canvas surface</button>
  </UiMenuTrigger>
  <UiMenuContent>
    <UiMenuLabel>Canvas</UiMenuLabel>
    <UiMenuItem @select="() => log('Create sticky')">
      Create sticky
    </UiMenuItem>
    <UiMenuItem @select="() => log('Link block')">
      Link block
    </UiMenuItem>
    <UiMenuSeparator />
    <UiMenuItem danger @select="() => log('Delete selection')">
      Delete selection
    </UiMenuItem>
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
      <p class="menu-demo-eyebrow">Context trigger</p>
      <h3 class="menu-demo-title">Right-click to place menus exactly at pointer coordinates.</h3>
      <p class="menu-demo-text">
        Pass <code>trigger="contextmenu"</code> to `UiMenuTrigger` and keep your own surface element through
        <code>as-child</code>. The controller handles positioning and focus management automatically.
      </p>
    </div>

    <div class="demo-workspace">
      <template v-if="usingVue">
        <div class="menu-demo-surface flex flex-col items-center gap-6 text-center">
          <UiMenu>
            <UiMenuTrigger as-child trigger="contextmenu">
              <button class="menu-demo-trigger">Context menu (right-click)</button>
            </UiMenuTrigger>
            <UiMenuContent class="menu-playground-panel">
              <UiMenuLabel>Canvas</UiMenuLabel>
              <UiMenuItem
                v-for="action in canvasActions"
                :key="action.label"
                @select="() => pushLog(action.label)"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-semibold">{{ action.label }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
                </div>
                <span v-if="action.shortcut" class="text-xs text-(--ui-menu-muted)">{{ action.shortcut }}</span>
              </UiMenuItem>
              <UiMenuSeparator />
              <UiMenuItem
                v-for="action in destructiveActions"
                :key="action.label"
                :danger="action.danger"
                @select="() => pushLog(action.label)"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-semibold">{{ action.label }}</span>
                  <span class="text-xs text-(--ui-menu-muted)">{{ action.detail }}</span>
                </div>
              </UiMenuItem>
            </UiMenuContent>
          </UiMenu>
        </div>
      </template>
      <ReactMount v-else :component="ContextMenuDemo" :key="current" />
      <div class="demo-last-action">
        <span class="demo-last-action__label">Last action</span>
        <span class="demo-last-action__value">{{ lastLog }}</span>
      </div>
    </div>

    <pre class="demo-code">
<code>
  <code v-html="highlighted" />
</code>
</pre>
  </section>
</template>
