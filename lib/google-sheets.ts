import "server-only"

import { google } from "googleapis"
import { ICS_COLUMNS } from "./ics"
export type { ICS } from "./ics"
import { SPREADSHEETS } from "./spreadsheet"

export type District = {
  DistrictCode: string
  DistrictName: string
}

// ICS type is re-exported from lib/ics

function getAuth() {
  const email =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const key = (
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GOOGLE_SHEETS_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n")
  if (!email || !key) {
    throw new Error(
      "Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY/GOOGLE_SHEETS_PRIVATE_KEY"
    )
  }
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })
}

export async function getDistricts(): Promise<District[]> {
  const spreadsheetId = SPREADSHEETS.master_data.id
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const rangeSheet = SPREADSHEETS.master_data.sheet.District.name
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: rangeSheet,
  })
  const rows = res.data.values || []
  if (!rows.length) return []
  const [headers, ...data] = rows
  const idxCode = headers.indexOf("DistrictCode")
  const idxName = headers.indexOf("DistrictName")
  if (idxCode === -1 || idxName === -1) return []
  return data
    .filter((r) => r[idxCode] || r[idxName])
    .map((r) => ({
      DistrictCode: String(r[idxCode] || ""),
      DistrictName: String(r[idxName] || ""),
    }))
}

export async function getICS(): Promise<import("./ics").ICS[]> {
  const spreadsheetId = SPREADSHEETS.master_data.id
  const auth = getAuth()
  const sheetsApi = google.sheets({ version: "v4", auth })
  const rangeSheet = SPREADSHEETS.master_data.sheet.ICS.name

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range: rangeSheet,
  })

  const rows = res.data.values || []
  if (!rows.length) return []
  const [headers, ...data] = rows

  const headerIndex = new Map<string, number>()
  headers.forEach((h, i) => headerIndex.set(String(h), i))

  return data
    .filter((r) => r.length)
    .map((r) => {
      const obj: Record<string, string> = {}
      for (const col of ICS_COLUMNS) {
        const i = headerIndex.get(col.sheet)
        obj[col.key] = String((i !== undefined ? r[i] : "") || "")
      }
      return obj as import("./ics").ICS
    })
}
