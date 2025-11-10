export type MT = {
  outcome: string
  output: string
  act_code: string
  act: string
  status: string
  progress: string
  comment: string
}

// Initial column widths (px) for Monthly MT table. Adjust freely.
// Keys must match the column accessorKey.
export const MT_COLUMN_SIZING: Record<string, number> = {
  outcome: 100,
  output: 100,
  act_code: 30,
  act: 300,
  status: 10,
  progress: 30,
  comment: 300,
}
