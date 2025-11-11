import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryParam = (searchParams.get("category") || "OUTCOME").toUpperCase()
  if (!(["OUTCOME", "OUTPUT", "ACTIVITY"] as const).includes(categoryParam as any)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }
  const records = await prisma.impactNode.findMany({
    where: { category: categoryParam as any },
    orderBy: { order: "asc" },
  })
  const childrenOf = new Map<string | null, Array<{ dbId: string; order: number }>>()
  const nodeByDbId = new Map<string, any>()
  for (const r of records) {
    nodeByDbId.set(r.id, {
      id: r.key,
      label: r.label,
      baseline: r.baseline ?? undefined,
      intermediary: r.intermediary ?? undefined,
      msa: r.msa ?? undefined,
      type: r.type ?? undefined,
      lastChild: r.lastChild ?? false,
      children: [] as any[],
    })
    const k = r.parentId ?? null
    const arr = childrenOf.get(k) ?? []
    arr.push({ dbId: r.id, order: r.order })
    childrenOf.set(k, arr)
  }
  function build(list: Array<{ dbId: string; order: number }>): any[] {
    list.sort((a, b) => a.order - b.order)
    const out: any[] = []
    for (const it of list) {
      const n = nodeByDbId.get(it.dbId)
      const ch = childrenOf.get(it.dbId) ?? []
      n.children = build(ch)
      out.push(n)
    }
    return out
  }
  const roots = childrenOf.get(null) ?? []
  const tree = build(roots)
  return NextResponse.json(tree, { headers: { "Cache-Control": "no-store" } })
}
