"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnSizingState,
  type Cell,
  type Table as RTTable,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchKeys?: string[]
  searchPlaceholder?: string
  searchPlaceholders?: Record<string, string>
  enableColumnVisibility?: boolean
  defaultHiddenColumnIds?: string[]
  selectFilters?: {
    columnId: string
    label?: string
    options: { label: string; value: string }[]
    multi?: boolean
  }[]
  enableColumnResize?: boolean
  columnResizeMode?: "onChange" | "onEnd"
  getCellProps?: (cell: Cell<TData, any>) => React.TdHTMLAttributes<HTMLTableCellElement> | undefined
  enablePagination?: boolean
  initialColumnSizing?: ColumnSizingState
  renderCustomFilters?: (table: RTTable<TData>) => React.ReactNode
}

export function DataTable<TData, TValue>({ columns, data, searchKey, searchKeys, searchPlaceholder = "Search...", searchPlaceholders, enableColumnVisibility, defaultHiddenColumnIds, selectFilters, enableColumnResize = false, columnResizeMode = "onChange", getCellProps, enablePagination = true, initialColumnSizing, renderCustomFilters }: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: enablePagination ? 10 : data.length })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    const initial: VisibilityState = {}
    ;(defaultHiddenColumnIds || []).forEach((id) => {
      initial[id] = false
    })
    return initial
  })
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialColumnSizing || {})
  const [columnSizingInfo, setColumnSizingInfo] = React.useState({})
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode,
    state: { pagination, columnFilters, columnVisibility, columnSizing, columnSizingInfo },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
    // merge other states
    ...({} as any),
  })

  React.useEffect(() => {
    if (!enablePagination) {
      setPagination((prev) => ({ pageIndex: 0, pageSize: data.length }))
    }
  }, [enablePagination, data.length])

  return (
    <div className="w-full">
      {(searchKey || searchKeys?.length || selectFilters?.length || enableColumnVisibility || renderCustomFilters) && (
        <div className="flex flex-wrap items-center gap-2 py-2">
          {((searchKeys && searchKeys.length ? searchKeys : (searchKey ? [searchKey] : []))).map((key) => (
            <Input
              key={key}
              placeholder={searchPlaceholders?.[key] ?? searchPlaceholder}
              value={(table.getColumn(key)?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn(key)?.setFilterValue(e.target.value)}
              className="max-w-sm"
            />
          ))}
          {selectFilters?.map((sf) => {
            const col = table.getColumn(sf.columnId)
            if (sf.multi) {
              const value = (col?.getFilterValue() as string[]) ?? []
              return (
                <label key={sf.columnId} className="inline-flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{sf.label ?? sf.columnId}</span>
                  <select
                    multiple
                    className="min-h-9 rounded-md border bg-background px-2 py-1"
                    value={value}
                    onChange={(e) => {
                      const selected = Array.from(e.currentTarget.selectedOptions).map((o) => o.value)
                      col?.setFilterValue(selected)
                    }}
                  >
                    {sf.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              )
            }
            const value = (col?.getFilterValue() as string) ?? ""
            return (
              <label key={sf.columnId} className="inline-flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{sf.label ?? sf.columnId}</span>
                <select
                  className="h-9 rounded-md border bg-background px-2"
                  value={value}
                  onChange={(e) => col?.setFilterValue(e.target.value)}
                >
                  {sf.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          })}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
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
          )}
          {renderCustomFilters && (
            <div className="flex items-center gap-2">{renderCustomFilters(table as any)}</div>
          )}
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(enableColumnResize && "relative")}
                    style={enableColumnResize && columnSizing[header.column.id as any] != null ? { width: header.getSize() } : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {enableColumnResize && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none",
                          header.column.getIsResizing() ? "bg-foreground/40" : "bg-transparent"
                        )}
                      />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={enableColumnResize && columnSizing[cell.column.id as any] != null ? { width: cell.column.getSize() } : undefined}
                    {...(getCellProps ? getCellProps(cell as any) : undefined)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {enablePagination && (
        <div className="flex items-center justify-end gap-2 py-2">
          <div className="mr-auto text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
