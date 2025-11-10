"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { MT } from "@/lib/mt"
import { Badge } from "@/components/ui/badge"

export type MTDisplay = MT & {
  showOutcome: boolean
  showOutput: boolean
}

export const columns: ColumnDef<MTDisplay>[] = [
  {
    accessorKey: "outcome",
    header: "Outcome",
    cell: ({ row }) => (row.original.showOutcome ? <span>{row.original.outcome}</span> : <span />),
  },
  {
    accessorKey: "output",
    header: "Output",
    cell: ({ row }) => (row.original.showOutput ? <span>{row.original.output}</span> : <span />),
  },
  {
    accessorKey: "act",
    header: "Act",
    cell: ({ row }) => <span>{row.original.act}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const v = String(row.original.status || "").trim().toLowerCase()
      const label = v === "inprogress" ? "In Progress" : v === "not_started" ? "Not Started" : v ? v.charAt(0).toUpperCase() + v.slice(1) : "-"
      const variant = v === "done" ? "default" : v === "blocked" ? "destructive" : v === "inprogress" ? "secondary" : "outline"
      return <Badge variant={variant as any}>{label}</Badge>
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      if (value === "all") return true
      return String(row.getValue(id) ?? "").trim().toLowerCase() === String(value).trim().toLowerCase()
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const raw = String(row.original.progress || "").trim()
      const num = Number.parseInt(raw.replace(/%/g, ""))
      const pct = Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : 0
      return (
        <div className="flex w-40 items-center gap-2">
          <div className="relative h-2 w-full rounded bg-muted">
            <div className="absolute left-0 top-0 h-2 rounded bg-foreground" style={{ width: `${pct}%` }} />
          </div>
          <span className="tabular-nums text-xs text-muted-foreground">{pct}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => <span>{row.original.comment}</span>,
  },
]
