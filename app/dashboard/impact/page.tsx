'use client';

import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, ListChecks, Target } from 'lucide-react';

type TreeNode = {
  id: string;
  label: string;
  baseline?: string;
  intermediary?: string;
  msa?: string;
  type?: 'full';
  lastChild?: boolean;
  children?: TreeNode[];
};

type FlattenedRow = {
  id: string;
  label: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentId: string | null;
  baseline?: string;
  intermediary?: string;
  msa?: string;
  type?: 'full';
  lastChild?: boolean;
};

function flattenVisible(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth = 0,
  parentId: string | null = null,
): FlattenedRow[] {
  const out: FlattenedRow[] = [];
  for (const n of nodes) {
    const hasChildren = !!(n.children && n.children.length);
    const isExpanded = hasChildren && expanded.has(n.id);
    out.push({
      id: n.id,
      label: n.label,
      depth,
      hasChildren,
      isExpanded,
      parentId,
      baseline: n.baseline,
      intermediary: n.intermediary,
      msa: n.msa,
      type: n.type,
      lastChild: n.lastChild,
    });
    if (hasChildren && isExpanded) {
      out.push(...flattenVisible(n.children!, expanded, depth + 1, n.id));
    }
  }
  return out;
}

function TreeTable({ data }: { data: TreeNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    const set = new Set<string>();
    const first = data[0];
    if (first?.id) set.add(first.id);
    if (first?.children?.[0]?.id) set.add(first.children[0].id);
    setExpanded(set);
  }, [data]);
  const rows = useMemo(() => flattenVisible(data, expanded), [data, expanded]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dash = '—';

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-black">
      <table className="min-w-full table-fixed border-collapse" role="treegrid" aria-label="Smallholder HUB - Impact">
        <colgroup>
          <col className="w-[64%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:bg-black dark:text-zinc-200">
              Indicator
            </th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:bg-black dark:text-zinc-200">
              Baseline
            </th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:bg-black dark:text-zinc-200">
              Intermediery
            </th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:bg-black dark:text-zinc-200">
              MSA
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isFull = row.type === 'full';
            const labelEl = (
              <div
                className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100"
                style={{ paddingLeft: row.depth * 16 }}
              >
                {row.hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(row.id)}
                    className="grid h-6 w-6 place-items-center rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    aria-label={row.isExpanded ? 'Collapse' : 'Expand'}
                    aria-expanded={row.isExpanded}
                  >
                    {row.isExpanded ? '−' : '+'}
                  </button>
                ) : (
                  <span className="inline-block h-6 w-6" />
                )}
                <span>{row.label}</span>
              </div>
            );

            return (
              <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800" role="row" aria-level={row.depth + 1}>
                {isFull ? (
                  <td className="px-2 py-2 text-sm" role="gridcell" colSpan={4}>
                    {labelEl}
                  </td>
                ) : (
                  <>
                    <td className="px-2 py-2 text-sm" role="gridcell">{labelEl}</td>
                    {row.hasChildren ? (
                      <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell" colSpan={3}></td>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">{row.baseline ?? dash}</td>
                        <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">{row.intermediary ?? dash}</td>
                        <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">{row.msa ?? dash}</td>
                      </>
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const [outcome, setOutcome] = useState<TreeNode[] | null>(null);
  const [output, setOutput] = useState<TreeNode[] | null>(null);
  const [activity, setActivity] = useState<TreeNode[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetcher = async (category: string) => {
      const res = await fetch(`/api/impact?category=${category}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      return (await res.json()) as TreeNode[];
    };
    Promise.all([
      fetcher('OUTCOME'),
      fetcher('OUTPUT'),
      fetcher('ACTIVITY'),
    ])
      .then(([o, op, a]) => {
        if (ignore) return;
        setOutcome(o);
        setOutput(op);
        setActivity(a);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Smallholder HUB - Impact</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit aperiam neque sequi? Nulla recusandae quod ratione amet a rerum deserunt exercitationem beatae rem aut natus temporibus assumenda necessitatibus voluptas iusto cumque minus qui nemo, harum adipisci! Architecto, veritatis eligendi! Eum quia sapiente, incidunt reprehenderit deserunt iure, ipsam rerum quas molestiae harum dolore consequuntur illo, quidem tenetur aliquid praesentium officia? Laboriosam corporis ratione soluta, dolorum id modi vel aperiam accusantium et natus delectus, velit tenetur saepe non placeat qui error veritatis in facilis unde? Delectus culpa enim impedit fugit inventore repudiandae ut nihil reiciendis quia, modi consectetur praesentium eaque voluptatem beatae!
        </p>
      </div>
      <Tabs defaultValue="outcome">
        <TabsList>
          <TabsTrigger value="outcome">
            <Target />
            Outcome
          </TabsTrigger>
          <TabsTrigger value="output">
            <ListChecks />
            Output
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity />
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="outcome">
          {loading && !outcome ? (
            <div className="rounded-md border p-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : (
            <TreeTable data={outcome ?? []} />
          )}
        </TabsContent>
        <TabsContent value="output">
          {loading && !output ? (
            <div className="rounded-md border p-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : (
            <TreeTable data={output ?? []} />
          )}
        </TabsContent>
        <TabsContent value="activity">
          {loading && !activity ? (
            <div className="rounded-md border p-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : (
            <TreeTable data={activity ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
