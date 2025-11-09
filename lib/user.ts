import type { ModuleKey, ModulePermission } from "@/lib/module"
import { matchPermission } from "@/lib/module"

export type Role = "admin" | "manager" | "viewer"

export type AppUser = {
  id: string
  name: string
  email: string
  image?: string
  roles: Role[]
  permissions: ModulePermission[]
}

export const RolePermissions: Record<Role, ModulePermission[]> = {
  admin: ["*"],
  manager: [
    "dashboard.*",
    "master.*",
    "report.weekly.*",
    "report.monthly.mt",
  ],
  viewer: [
    "dashboard.main",
    "report.weekly.kampar",
    "report.weekly.rokan-hulu",
    "report.weekly.siak",
    "report.weekly.pelalawan",
  ],
}

export function getEffectivePermissions(user: Pick<AppUser, "roles"> & { overrides?: ModulePermission[] }): ModulePermission[] {
  const base = user.roles.flatMap((r) => RolePermissions[r] ?? [])
  const overrides = user.overrides ?? []
  return Array.from(new Set([...base, ...overrides]))
}

export function canAccess(user: Pick<AppUser, "permissions">, module: ModuleKey) {
  return matchPermission(user.permissions ?? [], module)
}
