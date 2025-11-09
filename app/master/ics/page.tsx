import { getICS } from "@/lib/google-sheets"
import ICSTable from "./table-client"

export const revalidate = 300

export default async function ICSPage() {
  const data = await getICS()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">ICS</h1>
      </div>
      <ICSTable data={data} />
    </div>
  )
}
