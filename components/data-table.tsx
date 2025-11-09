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
  useReactTable,
} from "@tanstack/react-table"

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
  }[]
}

export function DataTable<TData, TValue>({ columns, data, searchKey, searchKeys, searchPlaceholder = "Search...", searchPlaceholders, enableColumnVisibility, defaultHiddenColumnIds, selectFilters }: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    const initial: VisibilityState = {}
    ;(defaultHiddenColumnIds || []).forEach((id) => {
      initial[id] = false
    })
    return initial
  })
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { pagination, columnFilters, columnVisibility },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // merge other states
    ...({} as any),
  })

  return (
    <div className="w-full">
      {(searchKey || searchKeys?.length || selectFilters?.length || enableColumnVisibility) && (
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
            const value = (table.getColumn(sf.columnId)?.getFilterValue() as string) ?? ""
            return (
              <label key={sf.columnId} className="inline-flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{sf.label ?? sf.columnId}</span>
                <select
                  className="h-9 rounded-md border bg-background px-2"
                  value={value}
                  onChange={(e) => table.getColumn(sf.columnId)?.setFilterValue(e.target.value)}
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
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <TableCell key={cell.id}>
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
    </div>
  )
}
