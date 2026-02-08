import "./bootstrap"
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"
import "./demo-runtime"
import { bootstrapAffinoDatagridDemos } from "./datagrid-demo"

bootstrapAffinoLaravelAdapters()

if (typeof document !== "undefined") {
    bootstrapAffinoDatagridDemos(document)
    document.addEventListener("livewire:navigated", () => {
        bootstrapAffinoDatagridDemos(document)
    })
}
