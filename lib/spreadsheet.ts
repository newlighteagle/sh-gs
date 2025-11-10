export type SheetInfo = {
  name: string
  gid: number
}

export type SpreadsheetInfo = {
  id: string
  name: string
  sheet: Record<string, SheetInfo>
}

export const SPREADSHEETS = {
  master_data: {
    id: "1UoHRQpBWy0_QxxJ88tWxDNDbXNkQEsKYx3l1NqOt6og",
    name: "Master Data",
    sheet: {
      District: { name: "District", gid: 2023863048 },
      ICS: { name: "ICS", gid: 568903137 },
    },
  },
  report: {
    id: "1VPf9o0Q4_GddQqzWIQg3XglRTE7OUBFIzSBYavrV7cs",
    name: "Report",
    sheet: {
      MT: { name: "MT", gid: 0 },
      Riau: { name: "Riau", gid: 789298752 },
      Kampar: { name: "Kampar", gid: 1792680652 },
    },
  },
} as const

export type SpreadsheetKey = keyof typeof SPREADSHEETS
export type SheetKey<K extends SpreadsheetKey> = keyof typeof SPREADSHEETS[K]["sheet"] & string

export function getSpreadsheetId(key: SpreadsheetKey): string {
  return SPREADSHEETS[key].id
}

export function getSheetName<K extends SpreadsheetKey>(key: K, sheetKey: SheetKey<K>): string {
  // Narrow the union by treating the sheet map as a generic record for indexing.
  const sheetMap = SPREADSHEETS[key].sheet as Record<string, SheetInfo>
  return sheetMap[sheetKey].name
}

export function listSheets<K extends SpreadsheetKey>(key: K): { key: string; name: string; gid: number }[] {
  return Object.entries(SPREADSHEETS[key].sheet).map(([k, v]) => ({ key: k, name: v.name, gid: v.gid }))
}
