'use client';

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WARS } from '@/lib/wars';
import type { War, RegionId } from '@/lib/types';

interface Props {
  filterEra?: string;
  filterTag?: string;
  focusWarId?: string;
}

/* ── Region styling ── */
const REGION_COLORS: Record<number, string> = {
  0: '#60a5fa',   // blue
  1: '#34d399',   // emerald
  2: '#fbbf24',   // amber
  3: '#c084fc',   // purple
};
const REGION_BG: Record<number, string> = {
  0: 'rgba(59,130,246,0.06)',
  1: 'rgba(16,185,129,0.06)',
  2: 'rgba(245,158,11,0.06)',
  3: 'rgba(168,85,247,0.06)',
};
const REGION_BORDER: Record<number, string> = {
  0: 'rgba(59,130,246,0.2)',
  1: 'rgba(16,185,129,0.2)',
  2: 'rgba(245,158,11,0.2)',
  3: 'rgba(168,85,247,0.2)',
};
const REGION_LABELS: Record<number, string> = {
  0: '欧州', 1: 'アジア', 2: '中東・アフリカ', 3: '南北米',
};

/* ── Layout constants ── */
const BUCKET   = 25;    // years per column
const COL_W    = 185;   // px per year-bucket column
const NODE_W   = 140;   // default node width
const NODE_H   = 34;    // default node height
const NODE_GAP = 10;    // vertical gap between stacked nodes
const SLOT_H   = NODE_H + NODE_GAP;
const BAND_PAD = 20;    // top/bottom padding inside each region band
const BAND_SEP = 28;    // vertical gap between region bands
const L_PAD    = 24;    // left/right margin
const T_PAD    = 30;    // top margin (for year labels)
const ACCENT   = 4;     // left accent bar width
const R_LABEL_W = 52;   // reserved width for region label on left

/* ── Types ── */
interface LNode {
  id: string; x: number; y: number;
  w: number; h: number; fs: number;
  color: string; war: War;
}
interface LEdge {
  id: string; srcId: string; dstId: string; d: string;
}
interface Band {
  region: number; y: number; h: number;
}

/* ── Neighbour collector (for focus mode) ── */
function collectNeighbors(rootId: string, hops: number): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier = [rootId];
  for (let i = 0; i < hops; i++) {
    const next: string[] = [];
    for (const id of frontier) {
      const w = WARS.find(x => x.id === id);
      if (!w) continue;
      [...(w.causes ?? []), ...(w.influences ?? [])].forEach(n => {
        if (!visited.has(n)) { visited.add(n); next.push(n); }
      });
      WARS.forEach(other => {
        if (visited.has(other.id)) return;
        if ((other.causes ?? []).includes(id) || (other.influences ?? []).includes(id)) {
          visited.add(other.id); next.push(other.id);
        }
      });
    }
    frontier = next;
  }
  return visited;
}

/* ── Deterministic grid layout — zero overlaps guaranteed ── */
function computeLayout(pool: War[]) {
  const empty = {
    nodes: [] as LNode[], edges: [] as LEdge[], bands: [] as Band[],
    totalW: 800, totalH: 400,
    allCols: [] as number[], colXs: new Map<number, number>(),
  };
  if (!pool.length) return empty;

  /* 1. Group by (region, year-bucket), sort within group by year */
  const cells = new Map<string, War[]>();
  for (const w of pool) {
    const bk = `${w.region}:${Math.floor(w.year / BUCKET)}`;
    if (!cells.has(bk)) cells.set(bk, []);
    cells.get(bk)!.push(w);
  }
  cells.forEach(arr => arr.sort((a, b) => a.year - b.year));

  /* 2. Sorted column indices → X positions */
  const allCols = Array.from(new Set(pool.map(w => Math.floor(w.year / BUCKET)))).sort((a, b) => a - b);
  const colXs = new Map<number, number>(
    allCols.map((col, i) => [col, L_PAD + R_LABEL_W + i * COL_W])
  );

  /* 3. Max slots per region → band height */
  const maxSlots = [0, 1, 2, 3].map(r =>
    Math.max(1, ...allCols.map(col => (cells.get(`${r}:${col}`) ?? []).length))
  );
  const bandHs = maxSlots.map(s => BAND_PAD * 2 + s * SLOT_H - NODE_GAP);

  /* 4. Stack bands top-to-bottom */
  const bands: Band[] = [];
  let curY = T_PAD;
  for (let r = 0; r < 4; r++) {
    bands.push({ region: r, y: curY, h: bandHs[r] });
    curY += bandHs[r] + BAND_SEP;
  }

  /* 5. Assign exact (x, y) to each node */
  const nodes: LNode[] = pool.map(w => {
    const col  = Math.floor(w.year / BUCKET);
    const bk   = `${w.region}:${col}`;
    const grp  = cells.get(bk)!;
    const slot = grp.indexOf(w);
    const band = bands[w.region];

    // centre stack vertically within the band
    const stackH = grp.length * SLOT_H - NODE_GAP;
    const available = bandHs[w.region] - BAND_PAD * 2;
    const startY = band.y + BAND_PAD + Math.max(0, (available - stackH) / 2);

    const nw = w.weight === 3 ? 155 : w.weight === 2 ? 145 : NODE_W;
    const nh = w.weight === 3 ? 40  : w.weight === 2 ? 36  : NODE_H;
    const fs = w.weight === 3 ? 11  : w.weight === 2 ? 10  : 9;

    const colX = colXs.get(col)!;
    return {
      id: w.id,
      x: colX + (COL_W - nw) / 2,
      y: startY + slot * SLOT_H,
      w: nw, h: nh, fs,
      color: REGION_COLORS[w.region],
      war: w,
    };
  });

  /* 6. Build edges (bezier S-curves) */
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const idSet   = new Set(pool.map(w => w.id));
  const edges: LEdge[] = [];

  for (const w of pool) {
    for (const cid of w.causes ?? []) {
      if (!idSet.has(cid)) continue;
      const src = nodeMap.get(cid);
      const dst = nodeMap.get(w.id);
      if (!src || !dst) continue;

      const x1 = src.x + src.w, y1 = src.y + src.h / 2;
      const x2 = dst.x,         y2 = dst.y + dst.h / 2;
      const mx = (x1 + x2) / 2;
      edges.push({
        id: `${cid}->${w.id}`, srcId: cid, dstId: w.id,
        d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`,
      });
    }
  }

  const totalW = L_PAD + R_LABEL_W + allCols.length * COL_W + L_PAD;
  const totalH = curY - BAND_SEP + T_PAD;
  return { nodes, edges, bands, totalW, totalH, allCols, colXs };
}

/* ═══════════════════════════════════════
   Component
   ═══════════════════════════════════════ */
export default function CausalityGraph({ filterEra, filterTag, focusWarId }: Props) {
  const router   = useRouter();
  const svgRef   = useRef<SVGSVGElement>(null);
  const [tf, setTf] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  const [hoverId, setHoverId]           = useState<string | null>(null);
  const [importantOnly, setImportantOnly] = useState(false);

  /* Pool + layout */
  const layout = useMemo(() => {
    let pool = [...WARS];
    if (focusWarId) {
      const ids = collectNeighbors(focusWarId, 2);
      pool = pool.filter(w => ids.has(w.id));
    }
    if (filterEra && filterEra !== 'all') pool = pool.filter(w => w.era === filterEra);
    if (filterTag && filterTag !== 'all') pool = pool.filter(w => ((w.tags ?? []) as string[]).includes(filterTag));
    if (importantOnly) pool = pool.filter(w => (w.weight ?? 1) >= 2);
    return computeLayout(pool);
  }, [filterEra, filterTag, focusWarId, importantOnly]);

  const { nodes, edges, bands, totalW, totalH, allCols, colXs } = layout;

  /* Connected set for hover highlight */
  const connected = useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    edges.forEach(e => {
      if (e.srcId === hoverId) set.add(e.dstId);
      if (e.dstId === hoverId) set.add(e.srcId);
    });
    return set;
  }, [hoverId, edges]);

  /* Auto-fit when layout changes */
  useEffect(() => {
    const el = svgRef.current;
    if (!el || !nodes.length) return;
    const { width, height } = el.getBoundingClientRect();
    const scale = Math.min(1, width / (totalW + 20), height / (totalH + 20));
    setTf({ scale, x: (width - totalW * scale) / 2, y: (height - totalH * scale) / 2 });
  }, [totalW, totalH, nodes.length]);

  /* Zoom / pan */
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTf(t => {
      const f  = e.deltaY < 0 ? 1.12 : 0.89;
      const ns = Math.max(0.05, Math.min(5, t.scale * f));
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      return { scale: ns, x: mx - (mx - t.x) * ns / t.scale, y: my - (my - t.y) * ns / t.scale };
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = { sx: e.clientX, sy: e.clientY, tx: tf.x, ty: tf.y };
  }, [tf.x, tf.y]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setTf(t => ({
      ...t,
      x: dragging.current!.tx + e.clientX - dragging.current!.sx,
      y: dragging.current!.ty + e.clientY - dragging.current!.sy,
    }));
  }, []);

  const stopDrag = useCallback(() => { dragging.current = null; }, []);

  const zoomBy = useCallback((f: number) => {
    setTf(t => {
      const ns = Math.max(0.05, Math.min(5, t.scale * f));
      const el = svgRef.current;
      if (!el) return t;
      const { width, height } = el.getBoundingClientRect();
      return {
        scale: ns,
        x: width  / 2 - (width  / 2 - t.x) * ns / t.scale,
        y: height / 2 - (height / 2 - t.y) * ns / t.scale,
      };
    });
  }, []);

  const fitAll = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const scale = Math.min(1, width / (totalW + 20), height / (totalH + 20));
    setTf({ scale, x: (width - totalW * scale) / 2, y: (height - totalH * scale) / 2 });
  }, [totalW, totalH]);

  /* ── Render ── */
  return (
    <div className="relative w-full h-full select-none bg-[#080f1a] rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L7,2.5 L0,5 Z" fill="rgba(100,116,139,0.7)" />
          </marker>
          <marker id="arr-hot" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L7,2.5 L0,5 Z" fill="#94a3b8" />
          </marker>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${tf.x},${tf.y}) scale(${tf.scale})`}>

          {/* ── Region bands ── */}
          {bands.map(b => (
            <g key={b.region}>
              {/* Band background */}
              <rect
                x={L_PAD} y={b.y}
                width={totalW - L_PAD * 2} height={b.h}
                fill={REGION_BG[b.region]}
                stroke={REGION_BORDER[b.region]}
                strokeWidth={1} rx={6}
              />
              {/* Region label (left gutter) */}
              <text
                x={L_PAD + R_LABEL_W / 2} y={b.y + b.h / 2}
                fill={REGION_COLORS[b.region]}
                fontSize={10} fontWeight="700" textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {REGION_LABELS[b.region]}
              </text>
            </g>
          ))}

          {/* ── Year column labels ── */}
          {allCols.map(col => (
            <text
              key={col}
              x={(colXs.get(col) ?? 0) + COL_W / 2}
              y={T_PAD - 10}
              fill="#334155" fontSize={9} textAnchor="middle"
              style={{ pointerEvents: 'none' }}
            >
              {col * BUCKET}s
            </text>
          ))}

          {/* ── Edges ── */}
          {edges.map(e => {
            const hot = hoverId !== null && (e.srcId === hoverId || e.dstId === hoverId);
            return (
              <path
                key={e.id} d={e.d} fill="none"
                stroke={hot ? '#94a3b8' : '#1e3a5f'}
                strokeWidth={hot ? 1.5 : 1}
                opacity={hoverId !== null ? (hot ? 1 : 0.04) : 0.35}
                markerEnd={hot ? 'url(#arr-hot)' : 'url(#arr)'}
              />
            );
          })}

          {/* ── Nodes ── */}
          {nodes.map(n => {
            const dim = hoverId !== null && !connected?.has(n.id);
            const hot = hoverId === n.id;
            const label = n.war.name.length > 13 ? n.war.name.slice(0, 12) + '…' : n.war.name;
            return (
              <g
                key={n.id}
                onClick={() => router.push(`/wars/${n.id}`)}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor: 'pointer', opacity: dim ? 0.12 : 1, transition: 'opacity 0.1s' }}
              >
                {/* Glow halo */}
                {hot && (
                  <rect
                    x={n.x - 4} y={n.y - 4} width={n.w + 8} height={n.h + 8}
                    fill={n.color} opacity={0.14} rx={8} filter="url(#glow)"
                  />
                )}
                {/* Body */}
                <rect
                  x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={hot ? '#0d2137' : '#0a1929'}
                  stroke={hot ? n.color : 'rgba(51,65,85,0.7)'}
                  strokeWidth={hot ? 1.5 : 0.8}
                  rx={4}
                />
                {/* Left accent bar */}
                <rect
                  x={n.x} y={n.y} width={ACCENT} height={n.h}
                  fill={n.color} rx={4}
                />
                {/* War name */}
                <text
                  x={n.x + ACCENT + 7} y={n.y + n.h / 2 - (n.h > 36 ? 6 : 5)}
                  fontSize={n.fs} fontWeight="600"
                  fill={hot ? '#f1f5f9' : '#8b9ab5'}
                  dominantBaseline="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
                {/* Year */}
                <text
                  x={n.x + ACCENT + 7} y={n.y + n.h / 2 + (n.h > 36 ? 7 : 6)}
                  fontSize={8}
                  fill={hot ? n.color : '#3d5068'}
                  dominantBaseline="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {n.war.year}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => zoomBy(1.25)}
          className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded flex items-center justify-center text-base font-light"
        >＋</button>
        <button
          onClick={() => zoomBy(0.8)}
          className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded flex items-center justify-center text-base font-light"
        >－</button>
        <button
          onClick={fitAll}
          className="w-8 h-8 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded flex items-center justify-center text-xs"
        >⤢</button>
      </div>

      {/* ── Top bar ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-3 flex-wrap z-10">
        {([0, 1, 2, 3] as RegionId[]).map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: REGION_COLORS[r] }} />
            <span className="text-[10px] text-slate-500">{REGION_LABELS[r]}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setImportantOnly(v => !v)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              importantOnly
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-800/60 border-slate-700/40 text-slate-600 hover:text-slate-400'
            }`}
          >
            重要のみ
          </button>
          <span className="text-[10px] text-slate-700">{nodes.length}件・{edges.length}連鎖</span>
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <span className="absolute bottom-4 right-4 text-[10px] text-slate-800 z-10">
        スクロール：ズーム　ドラッグ：移動
      </span>
    </div>
  );
}
