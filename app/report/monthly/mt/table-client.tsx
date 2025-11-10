"use client"

import { DataTable } from "@/components/data-table"
import { columns, type MTDisplay } from "./columns"
import type { MT } from "@/lib/mt"

export default function MTTable({ data }: { data: MT[] }) {
  // Ensure data is sorted by outcome then output for proper grouping (optional; remove if sheet already sorted)
  const rows = [...data]

  const n = rows.length
  const outcomeSpan: number[] = Array(n).fill(0)
  const outputSpan: number[] = Array(n).fill(0)

  let i = 0
  while (i < n) {
    const outcome = String(rows[i].outcome ?? "")
    let j = i
    while (j < n && String(rows[j].outcome ?? "") === outcome) j++
    // rows [i, j) share same outcome
    outcomeSpan[i] = j - i
    // within that block, group by output
    let k = i
    while (k < j) {
      const output = String(rows[k].output ?? "")
      let r = k
      while (r < j && String(rows[r].output ?? "") === output) r++
      outputSpan[k] = r - k
      k = r
    }
    i = j
  }

  const display: (MTDisplay & { outcomeRowSpan: number; outputRowSpan: number })[] = rows.map((r, idx) => ({
    ...r,
    showOutcome: outcomeSpan[idx] > 0,
    showOutput: outputSpan[idx] > 0,
    outcomeRowSpan: outcomeSpan[idx],
    outputRowSpan: outputSpan[idx],
  }))

  return (
    <DataTable
      columns={columns as any}
      data={display}
      enableColumnResize
      columnResizeMode="onEnd"
      enablePagination={false}
      getCellProps={(cell) => {
        const row = cell.row
        const original = row.original as any
        if (cell.column.id === "outcome") {
          const span = original.outcomeRowSpan as number
          if (span > 0) return { rowSpan: span }
          return { style: { display: "none" } }
        }
        if (cell.column.id === "output") {
          const span = original.outputRowSpan as number
          if (span > 0) return { rowSpan: span }
          return { style: { display: "none" } }
        }
        return undefined
      }}
      searchKeys={["act", "status", "comment"]}
      searchPlaceholders={{ act: "Search Act...", status: "Search Status...", comment: "Search Comment..." }}
      enableColumnVisibility
      selectFilters={[
        {
          columnId: "status",
          label: "Status",
          options: [
            { label: "All", value: "" },
            { label: "done", value: "done" },
            { label: "inprogress", value: "inprogress" },
            { label: "blocked", value: "blocked" },
            { label: "not_started", value: "not_started" },
          ],
        },
      ]}
    />
  )
}
