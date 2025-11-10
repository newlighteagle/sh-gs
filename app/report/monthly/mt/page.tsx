import { getMT } from "@/lib/google-sheets"
import MTTable from "./table-client"

export const revalidate = 300

export default async function MTPage() {
  const data = await getMT()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Monthly Report - MT</h1>
      </div>
      <MTTable data={data} />
    </div>
  )
}
