<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import {
  activateListboxIndex,
  createListboxState,
  moveListboxFocus,
  type ListboxState,
} from "@affino/listbox-vue"

type SelectValue = string | number

interface SelectOption {
  value: SelectValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: SelectValue | null | undefined
    options: readonly (SelectOption | SelectValue)[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: "Select",
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: "update:modelValue", value: SelectValue): void
  (event: "change", value: SelectValue): void
  (event: "blur"): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const listboxState = ref<ListboxState>(createListboxState())

const normalizedOptions = computed<SelectOption[]>(() =>
  props.options.map(option => {
    if (typeof option === "string" || typeof option === "number") {
      return { value: option, label: String(option) }
    }
    return {
      value: option.value,
      label: option.label,
      disabled: option.disabled,
    }
  }),
)

function valuesEqual(left: SelectValue | null | undefined, right: SelectValue | null | undefined): boolean {
  if (typeof left === "undefined" || left === null || typeof right === "undefined" || right === null) {
    return left === right
  }
  return String(left) === String(right)
}

const selectedIndex = computed(() =>
  normalizedOptions.value.findIndex(option => valuesEqual(option.value, props.modelValue)),
)

const selectedOption = computed(() => {
  const index = selectedIndex.value
  if (index < 0) {
    return null
  }
  return normalizedOptions.value[index] ?? null
})

const activeIndex = computed(() => listboxState.value.activeIndex)

function syncActiveIndex(nextIndex: number) {
  const optionCount = normalizedOptions.value.length
  if (optionCount <= 0) {
    listboxState.value = createListboxState()
    return
  }
  const safeIndex = Math.max(0, Math.min(optionCount - 1, nextIndex))
  listboxState.value = activateListboxIndex({
    state: listboxState.value,
    context: {
      optionCount,
      isDisabled: index => Boolean(normalizedOptions.value[index]?.disabled),
    },
    index: safeIndex,
  })
}

watch(
  [selectedIndex, normalizedOptions],
  ([nextIndex]) => {
    if (nextIndex >= 0) {
      syncActiveIndex(nextIndex)
      return
    }
    const firstEnabled = normalizedOptions.value.findIndex(option => !option.disabled)
    syncActiveIndex(firstEnabled >= 0 ? firstEnabled : 0)
  },
  { immediate: true },
)

function closeList(emitBlur = false) {
  if (isOpen.value) {
    isOpen.value = false
  }
  if (emitBlur) {
    emit("blur")
  }
}

function openList(preferredIndex?: number) {
  if (props.disabled || normalizedOptions.value.length === 0) {
    return
  }
  isOpen.value = true
  const selected = selectedIndex.value
  const fallback = selected >= 0 ? selected : 0
  syncActiveIndex(preferredIndex ?? fallback)
}

function commitIndex(index: number) {
  const option = normalizedOptions.value[index]
  if (!option || option.disabled) {
    return
  }
  emit("update:modelValue", option.value)
  emit("change", option.value)
  closeList()
}

function previewIndex(index: number) {
  const option = normalizedOptions.value[index]
  if (!option || option.disabled) {
    return
  }
  emit("update:modelValue", option.value)
}

function moveFocus(delta: number) {
  if (normalizedOptions.value.length === 0) {
    return
  }
  if (!isOpen.value) {
    openList()
    return
  }
  listboxState.value = moveListboxFocus({
    state: listboxState.value,
    context: {
      optionCount: normalizedOptions.value.length,
      isDisabled: index => Boolean(normalizedOptions.value[index]?.disabled),
    },
    delta,
    loop: true,
  })
}

function onTriggerClick() {
  if (props.disabled) {
    return
  }
  if (isOpen.value) {
    closeList()
    return
  }
  openList()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      event.stopPropagation()
      moveFocus(1)
      if (isOpen.value) {
        previewIndex(listboxState.value.activeIndex)
      }
      return
    case "ArrowUp":
      event.preventDefault()
      event.stopPropagation()
      moveFocus(-1)
      if (isOpen.value) {
        previewIndex(listboxState.value.activeIndex)
      }
      return
    case "Home":
      event.preventDefault()
      event.stopPropagation()
      openList(0)
      previewIndex(0)
      return
    case "End":
      event.preventDefault()
      event.stopPropagation()
      openList(Math.max(0, normalizedOptions.value.length - 1))
      previewIndex(Math.max(0, normalizedOptions.value.length - 1))
      return
    case "Enter":
      event.preventDefault()
      event.stopPropagation()
      if (!isOpen.value) {
        openList()
        return
      }
      commitIndex(activeIndex.value >= 0 ? activeIndex.value : 0)
      return
    case " ":
      event.preventDefault()
      event.stopPropagation()
      if (!isOpen.value) {
        openList()
        return
      }
      commitIndex(activeIndex.value >= 0 ? activeIndex.value : 0)
      return
    case "Escape":
      if (isOpen.value) {
        event.preventDefault()
        event.stopPropagation()
        closeList()
      }
      return
    case "Tab":
      closeList()
      return
    default:
      return
  }
}

function onOptionPointerDown(index: number, event: PointerEvent) {
  event.preventDefault()
  syncActiveIndex(index)
  commitIndex(index)
}

function onFocusOut(event: FocusEvent) {
  const nextFocused = event.relatedTarget as Node | null
  if (rootRef.value && nextFocused && rootRef.value.contains(nextFocused)) {
    return
  }
  closeList(true)
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) {
    return
  }
  const target = event.target as Node | null
  if (rootRef.value && target && rootRef.value.contains(target)) {
    return
  }
  closeList()
}

watch(isOpen, value => {
  if (typeof window === "undefined") {
    return
  }
  if (value) {
    window.addEventListener("pointerdown", onDocumentPointerDown, true)
  } else {
    window.removeEventListener("pointerdown", onDocumentPointerDown, true)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("pointerdown", onDocumentPointerDown, true)
  }
})
</script>

<template>
  <div
    ref="rootRef"
    class="affino-select"
    :data-state="isOpen ? 'open' : 'closed'"
    @focusout="onFocusOut"
    @keydown="onTriggerKeydown"
  >
    <button
      type="button"
      class="affino-select__trigger"
      data-affino-listbox-trigger
      data-affino-listbox-trigger-control
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :disabled="disabled"
      @click="onTriggerClick"
    >
      <span class="affino-select__value" data-affino-listbox-display :data-placeholder-visible="selectedOption ? 'false' : 'true'">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <span class="affino-select__icon" aria-hidden="true">▾</span>
    </button>

    <div
      v-if="isOpen"
      class="affino-select__surface"
      data-affino-listbox-surface
      role="listbox"
      tabindex="-1"
    >
      <button
        v-for="(option, index) in normalizedOptions"
        :key="`${option.value}`"
        type="button"
        class="affino-select__option"
        data-affino-listbox-option
        :data-affino-listbox-option-selected="selectedIndex === index ? 'true' : 'false'"
        :data-active="activeIndex === index ? 'true' : 'false'"
        role="option"
        :aria-selected="selectedIndex === index ? 'true' : 'false'"
        :disabled="option.disabled"
        @pointerdown="onOptionPointerDown(index, $event)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.affino-select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.affino-select__trigger {
  width: 100%;
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  text-align: left;
}

.affino-select__value[data-placeholder-visible="true"] {
  opacity: 0.75;
}

.affino-select__surface {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  min-width: 100%;
  max-height: 220px;
  overflow: auto;
  border: 1px solid rgba(145, 170, 210, 0.4);
  border-radius: 0.5rem;
  background: rgba(8, 13, 24, 0.98);
  z-index: 60;
  box-shadow: 0 8px 24px rgba(4, 7, 14, 0.44);
}

.affino-select__option {
  width: 100%;
  min-height: 1.9rem;
  display: flex;
  align-items: center;
  text-align: left;
  border: 0;
  border-bottom: 1px solid rgba(145, 170, 210, 0.14);
  background: transparent;
  color: var(--text-primary);
  padding: 0.35rem 0.6rem;
  cursor: pointer;
}

.affino-select__option:last-child {
  border-bottom: 0;
}

.affino-select__option[data-active="true"],
.affino-select__option:hover {
  background: rgba(17, 31, 53, 0.95);
}

.affino-select__option[data-affino-listbox-option-selected="true"] {
  background: rgba(56, 189, 248, 0.2);
  color: #e0f2fe;
}
</style>
