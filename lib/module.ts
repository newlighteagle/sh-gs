export type ModuleKey =
  | "dashboard.main"
  | "dashboard.kpi"
  | "master.district"
  | "master.ics"
  | "report.monthly.mt"
  | "report.weekly.kampar"
  | "report.weekly.rokan-hulu"
  | "report.weekly.siak"
  | "report.weekly.pelalawan"

export const ModulePaths: Record<ModuleKey, string> = {
  "dashboard.main": "/dashboard",
  "dashboard.kpi": "/dashboard/kpi",
  "master.district": "/master/district",
  "master.ics": "/master/ics",
  "report.monthly.mt": "/report/monthly/mt",
  "report.weekly.kampar": "/report/weekly/kampar",
  "report.weekly.rokan-hulu": "/report/weekly/rokan-hulu",
  "report.weekly.siak": "/report/weekly/siak",
  "report.weekly.pelalawan": "/report/weekly/pelalawan",
}

export type ModulePermission = string

export function routeToModule(pathname: string): ModuleKey | null {
  for (const [key, path] of Object.entries(ModulePaths) as [ModuleKey, string][]) {
    if (pathname === path) return key
  }
  const entry = (Object.entries(ModulePaths) as [ModuleKey, string][]).find(([, p]) =>
    pathname.startsWith(p)
  )
  return entry ? entry[0] : null
}

export function matchPermission(perms: ModulePermission[], key: ModuleKey): boolean {
  if (!perms || perms.length === 0) return false
  if (perms.includes("*")) return true
  if (perms.includes(key)) return true
  const parts = key.split(".")
  for (let i = parts.length; i > 0; i--) {
    const prefix = parts.slice(0, i).join(".")
    const wildcard = `${prefix}.*`
    if (perms.includes(wildcard)) return true
  }
  return false
}
