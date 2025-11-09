"use client"

import type { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "DistrictCode",
    header: "District Code",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("DistrictCode") as string}</span>
    ),
  },
  {
    accessorKey: "DistrictName",
    header: "District Name",
    cell: ({ row }) => <span>{row.getValue("DistrictName") as string}</span>,
  },
]
