import { createWorkspaceVitestConfig } from "../../config/vitest.base"

export default createWorkspaceVitestConfig(import.meta.url, {
  test: {
    environment: "node",
    globals: true,
    reporters: "dot",
    include: ["src/**/__tests__/**/*.spec.ts"],
  },
})
