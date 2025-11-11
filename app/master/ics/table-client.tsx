"use client"

import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import type { ICS } from "@/lib/ics"
import { ICS_COLUMNS } from "@/lib/ics"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ICSTable({ data }: { data: ICS[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKeys={["DistrictName", "ICSName"]}
      searchPlaceholders={{ DistrictName: "Search District...", ICSName: "Search ICS..." }}
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
      renderCustomFilters={(table) => {
        // Visible leaf columns and labels
        const leafCols = table
          .getAllLeafColumns()
          .filter((c) => c.getIsVisible())
        const headers = leafCols.map((c) =>
          typeof c.columnDef.header === "string" ? (c.columnDef.header as string) : c.id
        )

        const filteredRows = table.getFilteredRowModel().rows

        const getBody = () =>
          filteredRows.map((r) =>
            leafCols.map((c) => {
              const v = r.getValue<any>(c.id)
              if (c.id === "isKPI") {
                const raw = String(v ?? "").trim().toLowerCase()
                const truthy = ["1", "true", "yes", "y"].includes(raw)
                return truthy ? "Yes" : raw ? "No" : ""
              }
              return v == null ? "" : String(v)
            })
          )

        const exportExcel = () => {
          const aoa = [headers, ...getBody()]
          const ws = XLSX.utils.aoa_to_sheet(aoa)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "ICS")
          const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
          XLSX.writeFile(wb, `ICS_${ts}.xlsx`)
        }

        const exportPDF = () => {
          const doc = new jsPDF({ orientation: "landscape" })
          autoTable(doc, {
            head: [headers],
            body: getBody(),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [30, 41, 59] },
            theme: "striped",
          })
          const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
          doc.save(`ICS_${ts}.pdf`)
        }

        return (
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              Export PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }}
    />
  )
}
