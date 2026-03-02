import "./bootstrap"
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"
import "./demo-runtime"
import { bootstrapAffinoDatagridDemos } from "./datagrid-demo"
import { bootstrapAffinoDatagridPivotDemos } from "./datagrid-pivot-demo"

function safeBootstrap(label, bootstrap) {
    try {
        bootstrap()
    } catch (error) {
        console.error(`[Affino] ${label} failed`, error)
    }
}

safeBootstrap("laravel adapters bootstrap", () => {
    bootstrapAffinoLaravelAdapters()
})

if (typeof document !== "undefined" && typeof window !== "undefined") {
    const runDatagridBootstrap = () => {
        bootstrapAffinoDatagridDemos(document)
        bootstrapAffinoDatagridPivotDemos(document)
        window.requestAnimationFrame(() => {
            bootstrapAffinoDatagridDemos(document)
            bootstrapAffinoDatagridPivotDemos(document)
        })
    }

    safeBootstrap("datagrid demo bootstrap", runDatagridBootstrap)
    document.addEventListener("livewire:initialized", () => {
        safeBootstrap("datagrid demo bootstrap", runDatagridBootstrap)
    })
    document.addEventListener("livewire:navigated", () => {
        safeBootstrap("datagrid demo bootstrap", runDatagridBootstrap)
    })
}
