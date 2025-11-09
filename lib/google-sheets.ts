import "server-only"

import { google } from "googleapis"

export type District = {
  DistrictCode: string
  DistrictName: string
}

export type ICS = {
  DistrictCode: string
  DistrictName: string
  ICSCode: string
  ICSName: string
  ICSAbrv: string
  "3FID": string
  isKPI: string
  "Registered Farmer": string
  "Registered Farmer (Actual)": string
  "Target Register (end of 1st SOW)": string
}

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
  const spreadsheetId =
    process.env.GOOGLE_SPREADSHEET_MASTER_DATA ||
    process.env.SHEET_MASTERDATA_ID ||
    "1UoHRQpBWy0_QxxJ88tWxDNDbXNkQEsKYx3l1NqOt6og"
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  // Resolve sheet name by gid if provided
  const gid = process.env.GOOGLE_SPREADSHEET_MASTER_GID_DISTRICT
  let rangeSheet = "District"
  if (gid) {
    try {
      const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties(sheetId,title))",
      })
      const title = meta.data.sheets
        ?.find((s) => s.properties?.sheetId === Number(gid))
        ?.properties?.title
      if (title) rangeSheet = title
    } catch (_) {
      // ignore and fallback to default name
    }
  }
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

export async function getICS(): Promise<ICS[]> {
  const spreadsheetId =
    process.env.GOOGLE_SPREADSHEET_MASTER_DATA ||
    process.env.SHEET_MASTERDATA_ID ||
    "1UoHRQpBWy0_QxxJ88tWxDNDbXNkQEsKYx3l1NqOt6og"
  const auth = getAuth()
  const sheetsApi = google.sheets({ version: "v4", auth })

  const gid = process.env.GOOGLE_SPREADSHEET_MASTER_GID_ICS
  let rangeSheet = "ICS"
  if (gid) {
    try {
      const meta = await sheetsApi.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties(sheetId,title))",
      })
      const title = meta.data.sheets
        ?.find((s) => s.properties?.sheetId === Number(gid))
        ?.properties?.title
      if (title) rangeSheet = title
    } catch (_) {
      // ignore and fallback to default name
    }
  }

  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range: rangeSheet,
  })

  const rows = res.data.values || []
  if (!rows.length) return []
  const [headers, ...data] = rows

  const idx = (name: string) => headers.indexOf(name)

  const idxDistrictCode = idx("DistrictCode")
  const idxDistrictName = idx("DistrictName")
  const idxICSCode = idx("ICSCode")
  const idxICSName = idx("ICSName")
  const idxICSAbrv = idx("ICSAbrv")
  const idx3FID = idx("3FID")
  const idxIsKPI = idx("isKPI")
  const idxRegFarmer = idx("Registered Farmer")
  const idxRegFarmerActual = idx("Registered Farmer (Actual)")
  const idxTargetRegister = idx("Target Register (end of 1st SOW)")

  return data
    .filter((r) => r.length)
    .map((r) => ({
      DistrictCode: String(r[idxDistrictCode] || ""),
      DistrictName: String(r[idxDistrictName] || ""),
      ICSCode: String(r[idxICSCode] || ""),
      ICSName: String(r[idxICSName] || ""),
      ICSAbrv: String(r[idxICSAbrv] || ""),
      "3FID": String(r[idx3FID] || ""),
      isKPI: String(r[idxIsKPI] || ""),
      "Registered Farmer": String(r[idxRegFarmer] || ""),
      "Registered Farmer (Actual)": String(r[idxRegFarmerActual] || ""),
      "Target Register (end of 1st SOW)": String(r[idxTargetRegister] || ""),
    }))
}
