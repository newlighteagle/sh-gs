"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { columns, type MTDisplay } from "./columns"
import type { MT } from "@/lib/mt"
import { MT_COLUMN_SIZING } from "@/lib/mt"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type FilterKey = "outcome" | "output" | "act_code" | "act" | "comment"

export default function MTTable({ data }: { data: MT[] }) {
  // Ensure data is sorted by outcome then output for proper grouping (optional; remove if sheet already sorted)
  const rows = [...data]

  const [filterKey, setFilterKey] = React.useState<FilterKey>("act")

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
      initialColumnSizing={MT_COLUMN_SIZING}
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
      renderCustomFilters={(table) => {
        const statusCol = table.getColumn("status")
        const statusVals = (statusCol?.getFilterValue() as string[]) ?? []
        const currentText = (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
        return (
          <div className="grid w-full grid-cols-3 items-center gap-3">
            {/* Left: single text filter with field selector */}
            <div className="flex items-center gap-2 justify-start">
              <label className="inline-flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Filter Field</span>
                <select
                  className="h-9 rounded-md border bg-background px-2"
                  value={filterKey}
                  onChange={(e) => {
                    const nextKey = e.target.value as FilterKey
                    ;(["outcome", "output", "act_code", "act", "comment"] as FilterKey[]).forEach((k) => {
                      if (k !== nextKey) table.getColumn(k)?.setFilterValue("")
                    })
                    setFilterKey(nextKey)
                  }}
                >
                  <option value="outcome">Outcome</option>
                  <option value="output">Output</option>
                  <option value="act_code">Act Code</option>
                  <option value="act">Act</option>
                  <option value="comment">Comment</option>
                </select>
              </label>
              <Input
                className="w-[360px]"
                placeholder={`Filter ${filterKey.replace("_", " ")}...`}
                value={currentText}
                onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
              />
            </div>

            {/* Center: status toggle group */}
            <div className="inline-flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <ToggleGroup
                type="multiple"
                value={statusVals}
                onValueChange={(vals: string[]) => statusCol?.setFilterValue(vals)}
                className="flex-wrap"
                size="sm"
              >
                <ToggleGroupItem value="done">Done</ToggleGroupItem>
                <ToggleGroupItem value="inprogress">In Progress</ToggleGroupItem>
                <ToggleGroupItem value="blocked">Blocked</ToggleGroupItem>
                <ToggleGroupItem value="not_started">Not Started</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Right: columns visibility */}
            <div className="flex justify-end">
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
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      }}
    />
  )
}
