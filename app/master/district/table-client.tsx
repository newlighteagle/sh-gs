"use client"

import { DataTable } from "@/components/data-table"
import { columns } from "./columns"

type DistrictRow = { DistrictCode: string; DistrictName: string }

export default function DistrictTable({ data }: { data: DistrictRow[] }) {
  return <DataTable columns={columns} data={data} />
}
