import type { LucideIcon } from "lucide-react"
import { BookOpen, Building2, PieChart } from "lucide-react"
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
          { title: "Pelalawan", url: "/report/weekly/pelalawan" }
        ],
      },
    ],
  },
  {
    title: "ICS Profile",
    icon: Building2,
    items: [
      {
        title: "1404 - Pelalawan",
        items: [{ title: "KUD Mulia", url: "/ics/pelalawan/mul" }],
      },
      {
        title: "1405 - Siak",
        items: [
          { title: "KPM Karya Maju", url: "/ics/siak/kmj" },
          { title: "APKASDU", url: "/ics/siak/dyn" },
          { title: "APKSMB", url: "/ics/siak/smb" },
          { title: "ASERMISAS", url: "/ics/siak/mis" },
          { title: "APKSSB", url: "/ics/siak/ssb" },
          { title: "APKASAIBER", url: "/ics/siak/sai" },
          { title: "ASPEKSAB", url: "/ics/siak/sab" },
          { title: "KP PKSJ", url: "/ics/siak/rap" },
          { title: "KBJ", url: "/ics/siak/kbj" },
          { title: "KSJ", url: "/ics/siak/ksj" },
        ],
      },
      {
        title: "1406 - Kampar",
        items: [
          { title: "APSS - Sei Galuh", url: "/ics/kampar/apss" },
          { title: "KUD Karya Sembada", url: "/ics/kampar/ksm" },
          { title: "KUD Hasrat Jaya Pagaruyung", url: "/ics/kampar/hjp" },
          { title: "FORTASKI", url: "/ics/kampar/fk" },
          { title: "FPS - Sei Garo", url: "/ics/kampar/sgo" },
          { title: "KP Kusuma Bakti Mandiri", url: "/ics/kampar/kbm" },
          { title: "Kopsa Tri Manunggal", url: "/ics/kampar/ktm" },
          { title: "Teratai Sawit Lestari - Sungai Putih", url: "/ics/kampar/tsl" },
          { title: "PPKS-Pangkalan Baru Sejahtera", url: "/ics/kampar/pbs" },
          { title: "Hangtuah", url: "/ics/kampar/ht" },
        ],
      },
      {
        title: "1407 - Rokan Hulu",
        items: [
          { title: "KUD Tujuh Permata", url: "/ics/rohul/tjp" },
          { title: "KUD Intan Makmur", url: "/ics/rohul/itm" },
          { title: "KUD Sawit Sejahtera", url: "/ics/rohul/ssj" },
          { title: "FPSS Semarak Mudo", url: "/ics/rohul/sm" },
          { title: "PPKSS Tayo Barokah", url: "/ics/rohul/tbr" },
          { title: "APKASA Rayon SKPE", url: "/ics/rohul/skpe" },
          { title: "ASPEK RAS", url: "/ics/rohul/ras" },
          { title: "ASPEK RSB", url: "/ics/rohul/rsb" },
          { title: "ASPEK KRE", url: "/ics/rohul/kre" },
        ],
      },
    ],
  },
]
