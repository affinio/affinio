import type { DataGridColumnDef } from "@affino/datagrid-vue"

export interface WorkerOwnedDemoRow {
  rowId: string
  region: "AMER" | "EMEA" | "APAC"
  team: "core" | "payments" | "platform" | "growth"
  owner: "NOC" | "SRE" | "Platform" | "Payments"
  year: "2024" | "2025" | "2026"
  quarter: "Q1" | "Q2" | "Q3" | "Q4"
  orders: number
  revenue: number
  latencyMs: number
}

const REGIONS: readonly WorkerOwnedDemoRow["region"][] = ["AMER", "EMEA", "APAC"]
const TEAMS: readonly WorkerOwnedDemoRow["team"][] = ["core", "payments", "platform", "growth"]
const OWNERS: readonly WorkerOwnedDemoRow["owner"][] = ["NOC", "SRE", "Platform", "Payments"]
const YEARS: readonly WorkerOwnedDemoRow["year"][] = ["2024", "2025", "2026"]
const QUARTERS: readonly WorkerOwnedDemoRow["quarter"][] = ["Q1", "Q2", "Q3", "Q4"]

export const workerOwnedDemoColumns: readonly DataGridColumnDef[] = [
  { key: "region", label: "Region", width: 130, pin: "left" },
  { key: "team", label: "Team", width: 140, pin: "left" },
  { key: "owner", label: "Owner", width: 140 },
  { key: "year", label: "Year", width: 110 },
  { key: "quarter", label: "Quarter", width: 110 },
  { key: "orders", label: "Orders", width: 120 },
  { key: "revenue", label: "Revenue", width: 140 },
  { key: "latencyMs", label: "Latency ms", width: 130 },
]

export function createWorkerOwnedDemoRows(
  count: number,
  generation = 1,
): WorkerOwnedDemoRow[] {
  const normalized = Math.max(120, Math.round(count))
  const rows: WorkerOwnedDemoRow[] = []
  for (let index = 0; index < normalized; index += 1) {
    const seed = index + generation * 17
    rows.push({
      rowId: `worker-row-${generation}-${index + 1}`,
      region: REGIONS[index % REGIONS.length] ?? "AMER",
      team: TEAMS[Math.floor(index / REGIONS.length) % TEAMS.length] ?? "core",
      owner: OWNERS[(seed + Math.floor(index / 3)) % OWNERS.length] ?? "NOC",
      year: YEARS[Math.floor(index / (REGIONS.length * TEAMS.length)) % YEARS.length] ?? "2024",
      quarter: QUARTERS[Math.floor(index / (REGIONS.length * TEAMS.length * YEARS.length)) % QUARTERS.length] ?? "Q1",
      orders: 12 + ((seed * 9) % 280),
      revenue: 2_000 + ((seed * 41) % 22_000),
      latencyMs: 20 + ((seed * 13) % 320),
    })
  }
  return rows
}
