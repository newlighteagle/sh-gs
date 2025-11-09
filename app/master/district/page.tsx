import { getDistricts } from "@/lib/google-sheets"
import DistrictTable from "./table-client"

export const revalidate = 300

export default async function DistrictPage() {
  const data = await getDistricts()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">District</h1>
      </div>
      <DistrictTable data={data} />
    </div>
  )
}
