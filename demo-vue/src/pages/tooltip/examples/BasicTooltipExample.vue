<script setup lang="ts">
import { computed } from "vue"
import { useTooltipController } from "@affino/tooltip-vue"

const controller = useTooltipController(
  {
    id: "tooltip-basic-demo",
    openDelay: 120,
    closeDelay: 120,
  },
)

const state = controller.state
const triggerProps = computed(() => controller.getTriggerProps())
const tooltipProps = computed(() => controller.getTooltipProps())
</script>

<template>
  <article class="tooltip-card">
    <p class="tooltip-card__eyebrow">Mode 01</p>
    <h3 class="tooltip-card__title">Hover + focus</h3>
    <p class="tooltip-card__text">
      Default hover semantics paired with a11y-friendly focus handling. Move between mouse and keyboard without
      re-initializing the controller.
    </p>

    <div class="tooltip-stage">
      <button type="button" class="tooltip-trigger" v-bind="triggerProps">
        Inspect SLA
      </button>

      <transition name="tooltip-fade">
        <div v-if="state.open" class="tooltip-bubble" v-bind="tooltipProps">
          <p class="tooltip-bubble__title">Always-on</p>
          <p class="tooltip-bubble__body">
            Incident response under 4 minutes with on-call coverage across 11 regions.
          </p>
        </div>
      </transition>
    </div>

    <p class="tooltip-state-chip">State · {{ state.open ? "open" : "closed" }}</p>
  </article>
</template>
