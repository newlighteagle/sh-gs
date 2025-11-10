"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { ICS } from "@/lib/ics"
import { ICS_COLUMNS } from "@/lib/ics"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<ICS>[] = ICS_COLUMNS.map((c) => {
  if (c.key === "isKPI") {
    return {
      accessorKey: c.key,
      header: c.abbr || c.key,
      cell: ({ row }) => {
        const raw = String(row.getValue(c.key) ?? "").trim().toLowerCase()
        const truthy = ["1", "true", "yes", "y"].includes(raw)
        return truthy ? (
          <Badge variant="secondary" className="gap-1">
            <Check className="h-3.5 w-3.5" /> KPI
          </Badge>
        ) : (
          <Badge variant="outline">—</Badge>
        )
      },
      filterFn: (row, id, value) => {
        const raw = String(row.getValue(id) ?? "").trim().toLowerCase()
        const truthy = ["1", "true", "yes", "y"].includes(raw)
        if (!value) return true // All
        if (value === "yes") return truthy
        if (value === "no") return !truthy
        return true
      },
    }
  }
  return {
    accessorKey: c.key,
    header: c.abbr || c.key,
    cell: ({ row }) => <span>{String(row.getValue(c.key) ?? "")}</span>,
  }
})
