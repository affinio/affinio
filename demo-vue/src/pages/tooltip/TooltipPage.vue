<script setup lang="ts">
import BasicTooltipExample from "./examples/BasicTooltipExample.vue"
import FieldTooltipExample from "./examples/FieldTooltipExample.vue"
import ManualTooltipExample from "./examples/ManualTooltipExample.vue"

const highlights = [
  {
    title: "Pointer aware",
    body: "Surface timers sit on the shared kernel so hover, focus, and manual control stay in sync across stacks.",
  },
  {
    title: "Form friendly",
    body: "Focus hooks make it easy to show contextual help without fighting blur/focus timing glitches.",
  },
  {
    title: "Programmatic",
    body: "Call open/close/toggle imperatively to script onboarding tours or analytics-driven nudges.",
  },
]
</script>

<template>
  <section class="tooltip-page">
    <header class="tooltip-hero">
      <p class="tooltip-hero__eyebrow">Surface core</p>
      <h1>Tooltips fueled by SurfaceCore</h1>
      <p>
        <code>@affino/tooltip-vue</code> is a thin wrapper around the shared surface kernel, so hover, focus, and
        timers behave exactly like menus. Declare kernel traits (owner, priority, modality) per tooltip to choreograph
        stacked nudges, then try the variations below to see pointer-driven, focus-driven, and manual control flows.
      </p>
    </header>

    <ul class="tooltip-highlights">
      <li v-for="item in highlights" :key="item.title">
        <p class="tooltip-highlights__title">{{ item.title }}</p>
        <p class="tooltip-highlights__body">{{ item.body }}</p>
      </li>
    </ul>

    <div class="tooltip-grid">
      <BasicTooltipExample />
      <FieldTooltipExample />
      <ManualTooltipExample />
    </div>
  </section>
</template>
