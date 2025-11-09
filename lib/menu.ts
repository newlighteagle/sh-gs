import type { LucideIcon } from "lucide-react"
import { BookOpen, PieChart } from "lucide-react"
import type { ModulePermission } from "@/lib/module"
import { matchPermission, routeToModule } from "@/lib/module"

export type MenuItem = {
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: MenuItem[]
}

export function filterMenuByPermissions(items: MenuItem[], perms: ModulePermission[]): MenuItem[] {
  const recurse = (arr: MenuItem[]): MenuItem[] => {
    const out: MenuItem[] = []
    for (const item of arr) {
      const children = item.items ? recurse(item.items) : undefined
      const key = item.url ? routeToModule(item.url) : null
      const allowed = key ? matchPermission(perms, key) : false
      if (allowed || (children && children.length > 0)) {
        out.push({ ...item, items: children })
      }
    }
    return out
  }
  return recurse(items)
}

export const navMain: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
    isActive: true,
    items: [
      { title: "Main", url: "/dashboard" },
      { title: "KPI", url: "/dashboard/kpi" },
    ],
  },
  {
    title: "Master Data",
    icon: BookOpen,
    items: [
      { title: "District", url: "/master/district" },
      { title: "ICS", url: "/master/ics" },
    ],
  },
  {
    title: "Report",
    icon: PieChart,
    items: [
      {
        title: "Monthly",
        items: [{ title: "MT", url: "/report/monthly/mt" }],
      },
      {
        title: "Weekly",
        items: [
          { title: "Kampar", url: "/report/weekly/kampar" },
          { title: "Rokan Hulu", url: "/report/weekly/rokan-hulu" },
          { title: "Siak", url: "/report/weekly/siak" },
          { title: "Pelalawan", url: "/report/weekly/pelalawan" },
        ],
      },
    ],
  },
]
