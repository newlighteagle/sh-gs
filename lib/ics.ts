export type ICSKey =
  | "DistrictCode"
  | "DistrictName"
  | "ICSCode"
  | "ICSName"
  | "ICSAbrv"
  | "3FID"
  | "isKPI"
  | "RF_IT3"
  | "RF_Actual"
  | "RF_1st_SOW"
  | "RF_2nd_SOW"
  | "RF_3rd_SOW"
  | "TotalPersil"
  | "LuasPersil"

export type ICS = Record<ICSKey, string>

export type ICSColumnConfig = {
  key: ICSKey
  sheet: string
  abbr: string
  note?: string
  hidden?: boolean
}

export const ICS_COLUMNS: ICSColumnConfig[] = [
  { key: "DistrictCode", sheet: "DistrictCode", abbr: "Dist Code", hidden: true },
  { key: "DistrictName", sheet: "DistrictName", abbr: "District" },
  { key: "ICSCode", sheet: "ICSCode", abbr: "ICS Code", hidden: true },
  { key: "ICSName", sheet: "ICSName", abbr: "ICS" },
  { key: "ICSAbrv", sheet: "ICSAbrv", abbr: "Abrv" },
  { key: "3FID", sheet: "3FID", abbr: "3FID" },
  { key: "isKPI", sheet: "isKPI (1st SOW)", abbr: "KPI" },
  { key: "RF_IT3", sheet: "Registered Farmer (RF) IT-3", abbr: "RF IT3", note: "Registered Farmer on IT3 Report" },
  { key: "RF_Actual", sheet: "RF-Actual in Database", abbr: "RF Actual", note: "Registered Farmer on Actual Input in Database" },
  { key: "RF_1st_SOW", sheet: "RF-1st SOW", abbr: "RF 1st SOW", note: "Targeted Registered Farmer on 1st SOW" },
  { key: "RF_2nd_SOW", sheet: "RF-2st SOW", abbr: "RF 2nd SOW", note: "Targeted Registered Farmer on 2nd SOW" },
  { key: "RF_3rd_SOW", sheet: "RF-3rd SOW", abbr: "RF 3rd SOW", note: "Targeted Registered Farmer on 3rd SOW" },
  { key: "TotalPersil", sheet: "Total Persil", abbr: "Total Persil" },
  { key: "LuasPersil", sheet: "Luas Persil", abbr: "Luas Persil" },
]
