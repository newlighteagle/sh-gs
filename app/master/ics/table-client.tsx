"use client"

import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import type { ICS } from "@/lib/ics"
import { ICS_COLUMNS } from "@/lib/ics"

export default function ICSTable({ data }: { data: ICS[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKeys={["DistrictName", "ICSName"]}
      searchPlaceholders={{ DistrictName: "Search District...", ICSName: "Search ICS..." }}
      enableColumnVisibility
      defaultHiddenColumnIds={ICS_COLUMNS.filter((c) => c.hidden).map((c) => c.key as string)}
      selectFilters={[
        {
          columnId: "isKPI",
          label: "isKPI",
          options: [
            { label: "All", value: "" },
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ]}
    />
  )
}
