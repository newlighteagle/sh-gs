"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { ICS } from "@/lib/google-sheets"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<ICS>[] = [
  // Follow sheet order:
  // [hide] DistrictCode, DistrictName, [hide] ICSCode, ICSName, ICSAbrv, 3FID, isKPI,
  // Registered Farmer, Registered Farmer (Actual), Target Register (end of 1st SOW)
  {
    accessorKey: "DistrictCode",
    header: "District Code",
    cell: ({ row }) => <span>{row.getValue("DistrictCode") as string}</span>,
  },
  {
    accessorKey: "DistrictName",
    header: "District Name",
    cell: ({ row }) => <span>{row.getValue("DistrictName") as string}</span>,
  },
  {
    accessorKey: "ICSCode",
    header: "ICS Code",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("ICSCode") as string}</span>
    ),
  },
  {
    accessorKey: "ICSName",
    header: "ICS Name",
    cell: ({ row }) => <span>{row.getValue("ICSName") as string}</span>,
  },
  {
    accessorKey: "ICSAbrv",
    header: "Abrv",
    cell: ({ row }) => <span>{row.getValue("ICSAbrv") as string}</span>,
  },
  {
    accessorKey: "3FID",
    header: "3FID",
    cell: ({ row }) => <span>{row.getValue("3FID") as string}</span>,
  },
  {
    accessorKey: "isKPI",
    header: "isKPI",
    cell: ({ row }) => {
      const raw = String(row.getValue("isKPI") ?? "").trim().toLowerCase()
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
  },
  {
    accessorKey: "Registered Farmer",
    header: "Registered Farmer",
    cell: ({ row }) => <span>{row.getValue("Registered Farmer") as string}</span>,
  },
  {
    accessorKey: "Registered Farmer (Actual)",
    header: "Registered Farmer (Actual)",
    cell: ({ row }) => (
      <span>{row.getValue("Registered Farmer (Actual)") as string}</span>
    ),
  },
  {
    accessorKey: "Target Register (end of 1st SOW)",
    header: "Target Register (end of 1st SOW)",
    cell: ({ row }) => (
      <span>{row.getValue("Target Register (end of 1st SOW)") as string}</span>
    ),
  },
]
