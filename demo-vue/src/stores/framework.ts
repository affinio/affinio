import { defineStore } from "pinia"
import { ref } from "vue"

export type Framework = "vue" | "react"

const STORAGE_KEY = "affino-demo-framework"

function readStoredFramework(): Framework {
  if (typeof window === "undefined") {
    return "vue"
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "vue" || stored === "react") {
      return stored
    }
  } catch (_) {
    // ignore storage errors in locked-down environments
  }
  return "vue"
}

export const useFrameworkStore = defineStore("framework", () => {
  const current = ref<Framework>(readStoredFramework())

  const setFramework = (next: Framework) => {
    current.value = next
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch (_) {
      // ignore persistence failures when storage is unavailable
    }
  }

  return {
    current,
    setFramework,
  }
})
