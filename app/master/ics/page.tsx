import { getICS } from "@/lib/google-sheets"
import { ICS_COLUMNS } from "@/lib/ics"
import ICSTable from "./table-client"

export const revalidate = 300

export default async function ICSPage() {
  const data = await getICS()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">ICS (Internal Control System)</h1>
      </div>
      <ICSTable data={data} />
      <div className="rounded-md border p-4">
        <p className="text-sm font-medium">Note</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {ICS_COLUMNS.filter((c) => c.note).map((c) => (
            <li key={c.key}>
              {c.abbr || c.key} = {c.note}
            </li>
          ))}
        </ul>
      </div>
      {/* 
      Todo : Create Note
      - RF IT3 = Registered Farmer on IT3 Report
      - RF Actual = Registered Farmer on Actual Input in Database
      - RF 1st SOW = Targeted Registered Farmer on 1st SOW
      - RF 2nd SOW = Targeted Registered Farmer on 2nd SOW
      - RF 3rd SOW = Targeted Registered Farmer on 3rd SOW
      */}
    </div>
  )
}
