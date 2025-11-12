'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, ListChecks, Target, FileSpreadsheet, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

function TreeTable({ data, category }: { data: TreeNode[]; category: 'OUTCOME' | 'OUTPUT' | 'ACTIVITY' }) {
  const { data: session } = useSession();
  const role = (session as any)?.user?.role as string | undefined;
  const canEdit = role === 'ADMINISTRATOR' || role === 'OPERATOR';

  const [model, setModel] = useState<TreeNode[]>(data);
  useEffect(() => setModel(data), [data]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    const set = new Set<string>();
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length) {
          set.add(n.id);
          walk(n.children);
        }
      }
    };
    walk(model);
    setExpanded(set);
  }, [model]);
  const rows = useMemo(() => flattenVisible(model, expanded), [model, expanded]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dash = '—';

  const flattenAll = useCallback((nodes: TreeNode[], depth = 0, acc: FlattenedRow[] = []): FlattenedRow[] => {
    for (const n of nodes) {
      const hasChildren = !!(n.children && n.children.length);
      acc.push({
        id: n.id,
        label: n.label,
        depth,
        hasChildren,
        isExpanded: true,
        parentId: null,
        baseline: n.baseline,
        intermediary: n.intermediary,
        msa: n.msa,
        type: n.type,
        lastChild: n.lastChild,
      });
      if (hasChildren) flattenAll(n.children!, depth + 1, acc);
    }
    return acc;
  }, []);

  const exportExcel = () => {
    const header = ['Indicator', 'Baseline', 'Intermediery', 'MSA'];
    const all = flattenAll(model);
    const body = all.map((r) => [
      `${'  '.repeat(r.depth)}${r.label}`,
      r.baseline ?? '',
      r.intermediary ?? '',
      r.msa ?? '',
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, category);
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `impact_${category.toLowerCase()}_${ts}.xlsx`);
  };

  const exportPdf = () => {
    const header = ['Indicator', 'Baseline', 'Intermediery', 'MSA'];
    const all = flattenAll(model);
    const body = all.map((r) => [
      `${'  '.repeat(r.depth)}${r.label}`,
      r.baseline ?? '',
      r.intermediary ?? '',
      r.msa ?? '',
    ]);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    autoTable(doc, {
      head: [header],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [245, 245, 245], textColor: 40, halign: 'left' },
      startY: 36,
      margin: { left: 24, right: 24 },
    });
    const ts = new Date().toISOString().slice(0, 10);
    doc.save(`impact_${category.toLowerCase()}_${ts}.pdf`);
  };

  const updateNode = useCallback((nodes: TreeNode[], id: string, patch: Partial<TreeNode>): TreeNode[] => {
    return nodes.map((n) => {
      if (n.id === id) {
        return { ...n, ...patch };
      }
      if (n.children && n.children.length) {
        return { ...n, children: updateNode(n.children, id, patch) };
      }
      return n;
    });
  }, []);

  async function saveField(id: string, field: 'label' | 'baseline' | 'intermediary' | 'msa', value: string) {
    const res = await fetch('/api/impact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, key: id, updates: { [field]: value } }),
    });
    if (!res.ok) throw new Error('Failed to save');
    setModel((prev) => updateNode(prev, id, { [field]: value } as any));
  }

  function EditableText({
    value,
    onSave,
    disabled,
    className,
  }: {
    value?: string;
    onSave: (v: string) => Promise<void>;
    disabled?: boolean;
    className?: string;
  }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value ?? '');
    const ref = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => setVal(value ?? ''), [value]);
    useEffect(() => {
      if (ref.current) {
        const el = ref.current;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }, [val, editing]);

    const commit = async () => {
      if (!editing) return;
      const newVal = val.trim();
      if (newVal !== (value ?? '')) {
        await onSave(newVal);
      }
      setEditing(false);
    };
    const cancel = () => {
      setVal(value ?? '');
      setEditing(false);
    };

    if (!editing) {
      return (
        <div
          className={(className ? className + ' ' : '') + 'whitespace-pre-wrap break-words'}
          onDoubleClick={() => {
            if (!disabled) setEditing(true);
          }}
        >
          {value && value.length ? value : dash}
        </div>
      );
    }
    return (
      <textarea
        ref={ref}
        rows={1}
        className={(className ? className + ' ' : '') + 'w-full resize-none bg-transparent outline-none border border-dashed border-zinc-400 focus:border-zinc-600 rounded px-2 py-1'}
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={async (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            await commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="outline" size="sm" onClick={exportExcel} title="Download as Excel">
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
        </Button>
        <Button variant="outline" size="sm" onClick={exportPdf} title="Download as PDF">
          <FileText className="h-4 w-4 mr-2" /> PDF
        </Button>
      </div>
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
              <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-700 border-b border-zinc-200 shadow-sm first:rounded-tl-md last:rounded-tr-md dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800">
                Indicator
              </th>
              <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-700 border-b border-zinc-200 shadow-sm first:rounded-tl-md last:rounded-tr-md dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800">
                Baseline
              </th>
              <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-700 border-b border-zinc-200 shadow-sm first:rounded-tl-md last:rounded-tr-md dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800">
                Intermediery
              </th>
              <th className="sticky top-0 z-20 bg-zinc-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-700 border-b border-zinc-200 shadow-sm first:rounded-tl-md last:rounded-tr-md dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800">
                MSA
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isFull = row.type === 'full';
              const isKeyRoot = /^\d+\.0\.0\.0$/.test(row.id);
              const labelEl = (
                <div
                  className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                    isFull ? 'font-semibold' : row.hasChildren ? 'font-medium' : 'font-normal'
                  } text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 ${isKeyRoot ? '!bg-yellow-50 dark:!bg-yellow-900/30 uppercase' : ''}`}
                  style={{ paddingLeft: row.depth * 16 }}
                >
                  {row.hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggle(row.id)}
                      className="grid h-6 w-6 place-items-center rounded border border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      aria-label={row.isExpanded ? 'Collapse' : 'Expand'}
                      aria-expanded={row.isExpanded}
                    >
                      {row.isExpanded ? '−' : '+'}
                    </button>
                  ) : (
                    <span className="inline-block h-6 w-6" />
                  )}
                  <EditableText
                    value={row.label}
                    disabled={!canEdit}
                    onSave={(v) => saveField(row.id, 'label', v)}
                    className={`min-w-0 flex-1 ${isFull ? 'text-base' : 'text-sm'}`}
                  />
                </div>
              );

              return (
                <tr
                  key={row.id}
                  className={`border-t border-zinc-200 dark:border-zinc-800 ${
                    isFull ? 'bg-zinc-50 dark:bg-zinc-900/40' : row.hasChildren ? 'bg-zinc-50/30 dark:bg-zinc-900/20' : ''
                  } ${isKeyRoot ? '!bg-yellow-50 dark:!bg-yellow-900/20 uppercase' : ''}`}
                  role="row"
                  aria-level={row.depth + 1}
                >
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
                          <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">
                            <EditableText
                              value={row.baseline}
                              disabled={!canEdit}
                              onSave={(v) => saveField(row.id, 'baseline', v)}
                              className="whitespace-pre-wrap break-words"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">
                            <EditableText
                              value={row.intermediary}
                              disabled={!canEdit}
                              onSave={(v) => saveField(row.id, 'intermediary', v)}
                              className="whitespace-pre-wrap break-words"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300" role="gridcell">
                            <EditableText
                              value={row.msa}
                              disabled={!canEdit}
                              onSave={(v) => saveField(row.id, 'msa', v)}
                              className="whitespace-pre-wrap break-words"
                            />
                          </td>
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
    </>
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
            <TreeTable data={outcome ?? []} category="OUTCOME" />
          )}
        </TabsContent>
        <TabsContent value="output">
          {loading && !output ? (
            <div className="rounded-md border p-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : (
            <TreeTable data={output ?? []} category="OUTPUT" />
          )}
        </TabsContent>
        <TabsContent value="activity">
          {loading && !activity ? (
            <div className="rounded-md border p-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : (
            <TreeTable data={activity ?? []} category="ACTIVITY" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
