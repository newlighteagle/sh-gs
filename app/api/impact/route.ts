import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryParam = (searchParams.get("category") || "OUTCOME").toUpperCase()
  if (!( ["OUTCOME", "OUTPUT", "ACTIVITY"] as const ).includes(categoryParam as any)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }
  const records = await prisma.impactNode.findMany({
    where: { category: categoryParam as any },
    orderBy: { key: "asc" },
  })
  const childrenOf = new Map<string | null, Array<{ dbId: string; key: string }>>()
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
    arr.push({ dbId: r.id, key: r.key })
    childrenOf.set(k, arr)
  }
  function build(list: Array<{ dbId: string; key: string }>): any[] {
    list.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: "base" }))
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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const role = (session as any)?.user?.role as string | undefined
    if (!role || !["ADMINISTRATOR", "OPERATOR"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const body = await req.json()
    const categoryParam = String(body?.category || "").toUpperCase()
    const key = String(body?.key || "")
    if (!categoryParam || !key) {
      return NextResponse.json({ error: "Missing category or key" }, { status: 400 })
    }
    if (!( ["OUTCOME","OUTPUT","ACTIVITY"] as const ).includes(categoryParam as any)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    const updatesRaw = body?.updates ?? {}
    const allowed = ["label","baseline","intermediary","msa"] as const
    const updates: Record<string, string | null> = {}
    for (const f of allowed) {
      if (Object.prototype.hasOwnProperty.call(updatesRaw, f)) {
        const v = updatesRaw[f]
        updates[f] = v === null ? null : String(v)
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }
    const node = await prisma.impactNode.findFirst({ where: { category: categoryParam as any, key } })
    if (!node) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const updated = await prisma.impactNode.update({ where: { id: node.id }, data: updates as any })
    return NextResponse.json({
      id: updated.key,
      label: updated.label,
      baseline: updated.baseline ?? undefined,
      intermediary: updated.intermediary ?? undefined,
      msa: updated.msa ?? undefined,
    })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
