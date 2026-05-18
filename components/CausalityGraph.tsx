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

const REGION_COLORS: Record<RegionId, string> = {
  0: '#3b82f6',
  1: '#06b6d4',
  2: '#f59e0b',
  3: '#a855f7',
};
const REGION_LABELS: Record<RegionId, string> = {
  0: '欧州', 1: 'アジア', 2: '中東・アフリカ', 3: '南北米',
};

function nodeSize(weight?: number) {
  const w = weight ?? 1;
  if (w === 3) return { w: 150, h: 54, fs: 12 };
  if (w === 2) return { w: 124, h: 44, fs: 11 };
  return { w: 100, h: 36, fs: 10 };
}

function collectNeighbors(rootId: string, hops: number): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier = [rootId];
  for (let i = 0; i < hops; i++) {
    const next: string[] = [];
    for (const id of frontier) {
      const w = WARS.find((x) => x.id === id);
      if (!w) continue;
      [...(w.causes ?? []), ...(w.influences ?? [])].forEach((n) => {
        if (!visited.has(n)) { visited.add(n); next.push(n); }
      });
      WARS.forEach((other) => {
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

/* simple force simulation — only moves Y, X stays year-based */
function forceLayout(
  items: { id: string; x: number; y0: number; w: number; h: number }[],
  links: { si: number; ti: number }[],
  iterations = 120,
) {
  const pos = items.map((n) => ({ x: n.x, y: n.y0 }));
  const REPEL = 3500;
  const SPRING = 0.06;
  const GRAVITY = 0.03;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion (Y only for same X-bucket)
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > 500) continue;
        const f = REPEL / (d * d);
        pos[i].y += (dy / d) * f * 0.5;
        pos[j].y -= (dy / d) * f * 0.5;
      }
    }
    // Spring attraction along edges (Y only)
    for (const lk of links) {
      const si = pos[lk.si], ti = pos[lk.ti];
      const dy = ti.y - si.y;
      si.y += dy * SPRING * 0.5;
      ti.y -= dy * SPRING * 0.5;
    }
    // Gravity toward region Y band
    for (let i = 0; i < pos.length; i++) {
      pos[i].y += (items[i].y0 - pos[i].y) * GRAVITY;
    }
  }
  return pos;
}

export default function CausalityGraph({ filterEra, filterTag, focusWarId }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tf, setTf] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { nodes, edges, bounds } = useMemo(() => {
    let pool: War[] = WARS;
    if (focusWarId) {
      const ids = collectNeighbors(focusWarId, 2);
      pool = pool.filter((w) => ids.has(w.id));
    }
    if (filterEra && filterEra !== 'all') pool = pool.filter((w) => w.era === filterEra);
    if (filterTag && filterTag !== 'all') pool = pool.filter((w) => ((w.tags ?? []) as string[]).includes(filterTag));

    const idSet = new Set(pool.map((w) => w.id));

    // Initial positions
    const buckets = new Map<string, number>();
    const items = pool.map((w) => {
      const x = (w.year + 3000) * 1.6;
      const bk = `${w.region}-${Math.floor(w.year / 20)}`;
      const slot = buckets.get(bk) ?? 0;
      buckets.set(bk, slot + 1);
      const { w: nw, h: nh, fs } = nodeSize(w.weight);
      const y0 = 80 + w.region * 220 + slot * 10;
      return { id: w.id, x, y0, w: nw, h: nh, fs, war: w };
    });

    const idxMap = new Map(items.map((n, i) => [n.id, i]));
    const links: { si: number; ti: number }[] = [];
    for (const w of pool) {
      for (const cid of w.causes ?? []) {
        if (!idSet.has(cid)) continue;
        const si = idxMap.get(cid);
        const ti = idxMap.get(w.id);
        if (si !== undefined && ti !== undefined) links.push({ si, ti });
      }
    }

    const pos = forceLayout(items, links);

    const nodes = items.map((item, i) => ({
      ...item,
      x: pos[i].x,
      y: pos[i].y,
      color: REGION_COLORS[item.war.region as RegionId],
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edges = links.map(({ si, ti }) => {
      const src = nodes[si], dst = nodes[ti];
      const x1 = src.x + src.w;
      const y1 = src.y + src.h / 2;
      const x2 = dst.x;
      const y2 = dst.y + dst.h / 2;
      const cx1 = x1 + (x2 - x1) * 0.4;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) * 0.6;
      const cy2 = y2;
      return { id: `${src.id}->${dst.id}`, srcId: src.id, dstId: dst.id, d: `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}` };
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x - 10);
      minY = Math.min(minY, n.y - 10);
      maxX = Math.max(maxX, n.x + n.w + 10);
      maxY = Math.max(maxY, n.y + n.h + 10);
    }
    const bounds = nodes.length
      ? { minX, minY, maxX, maxY }
      : { minX: 0, minY: 0, maxX: 800, maxY: 600 };

    return { nodes, edges, bounds };
  }, [filterEra, filterTag, focusWarId]);

  // Set of connected IDs when hovering
  const connected = useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    edges.forEach((e) => {
      if (e.srcId === hoverId) set.add(e.dstId);
      if (e.dstId === hoverId) set.add(e.srcId);
    });
    return set;
  }, [hoverId, edges]);

  // Auto-fit
  useEffect(() => {
    const el = svgRef.current;
    if (!el || nodes.length === 0) return;
    const { width, height } = el.getBoundingClientRect();
    const cw = bounds.maxX - bounds.minX + 60;
    const ch = bounds.maxY - bounds.minY + 60;
    const scale = Math.min(width / cw, height / ch, 1.2);
    const x = (width - cw * scale) / 2 - bounds.minX * scale + 30 * scale;
    const y = (height - ch * scale) / 2 - bounds.minY * scale + 30 * scale;
    setTf({ x, y, scale });
  }, [bounds, nodes.length]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTf((t) => {
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const ns = Math.max(0.04, Math.min(4, t.scale * factor));
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return t;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return { scale: ns, x: mx - (mx - t.x) * (ns / t.scale), y: my - (my - t.y) * (ns / t.scale) };
    });
  }, []);

  const onDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = { sx: e.clientX, sy: e.clientY, tx: tf.x, ty: tf.y };
  }, [tf]);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setTf((t) => ({ ...t, x: dragging.current!.tx + e.clientX - dragging.current!.sx, y: dragging.current!.ty + e.clientY - dragging.current!.sy }));
  }, []);
  const onUp = useCallback(() => { dragging.current = null; }, []);

  const fitView = useCallback(() => {
    const el = svgRef.current;
    if (!el || nodes.length === 0) return;
    const { width, height } = el.getBoundingClientRect();
    const cw = bounds.maxX - bounds.minX + 60;
    const ch = bounds.maxY - bounds.minY + 60;
    const scale = Math.min(width / cw, height / ch, 1.2);
    const x = (width - cw * scale) / 2 - bounds.minX * scale + 30 * scale;
    const y = (height - ch * scale) / 2 - bounds.minY * scale + 30 * scale;
    setTf({ x, y, scale });
  }, [bounds, nodes.length]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-xl" style={{ background: '#0f172a' }}>
        <p className="text-slate-400 text-sm">該当する戦争がありません</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden select-none" style={{ background: '#0f172a' }}>
      {/* legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        {(Object.entries(REGION_LABELS) as [string, string][]).map(([id, label]) => (
          <div key={id} className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2 py-1 rounded-full backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: REGION_COLORS[+id as RegionId] }} />
            {label}
          </div>
        ))}
      </div>

      {/* node count */}
      <div className="absolute top-3 right-3 z-10 text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full">
        {nodes.length} 件 · {edges.length} 連鎖
      </div>

      {/* zoom controls */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
        {(['+', '−', '⤢'] as const).map((icon, i) => (
          <button key={icon}
            onClick={() => i === 2 ? fitView() : setTf((t) => ({ ...t, scale: Math.max(0.04, Math.min(4, t.scale * (i === 0 ? 1.25 : 0.8))) }))}
            className="w-8 h-8 rounded-lg text-slate-200 text-sm flex items-center justify-center hover:bg-slate-600 transition"
            style={{ background: 'rgba(30,41,59,0.85)', border: '1px solid rgba(100,116,139,0.4)' }}>
            {icon}
          </button>
        ))}
      </div>

      {/* hint */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-slate-500">
        スクロール：ズーム　ドラッグ：移動
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={onWheel} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#475569" />
          </marker>
          <marker id="arrowhead-hi" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${tf.x},${tf.y}) scale(${tf.scale})`}>
          {/* edges */}
          {edges.map((e) => {
            const isHi = connected ? (connected.has(e.srcId) && connected.has(e.dstId)) : false;
            const dim = connected && !isHi;
            return (
              <path key={e.id} d={e.d} fill="none"
                stroke={isHi ? '#94a3b8' : '#334155'}
                strokeWidth={isHi ? 2 : 1}
                opacity={dim ? 0.15 : isHi ? 0.9 : 0.5}
                markerEnd={isHi ? 'url(#arrowhead-hi)' : 'url(#arrowhead)'}
                style={isHi ? { filter: 'url(#glow)' } : undefined}
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const isHover = hoverId === n.id;
            const isConn = connected ? connected.has(n.id) : false;
            const dim = connected && !isConn;
            const isFocus = focusWarId === n.id;
            const color = n.color;
            const yr = n.war.year < 0 ? `BC${-n.war.year}` : `${n.war.year}`;
            const yrEnd = n.war.endYear && n.war.endYear !== n.war.year
              ? `–${n.war.endYear < 0 ? 'BC' + (-n.war.endYear) : n.war.endYear}` : '';

            return (
              <g key={n.id}
                onClick={() => router.push(`/explore?war=${n.id}`)}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor: 'pointer', opacity: dim ? 0.2 : 1, transition: 'opacity 0.15s' }}>
                {/* glow bg on hover */}
                {(isHover || isFocus) && (
                  <rect x={n.x - 4} y={n.y - 4} width={n.w + 8} height={n.h + 8} rx={10}
                    fill={color} opacity={0.25} style={{ filter: 'blur(8px)' }} />
                )}
                {/* main rect */}
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={7}
                  fill={isHover || isConn ? color : `${color}99`}
                  stroke={isFocus ? '#facc15' : isHover ? color : `${color}66`}
                  strokeWidth={isFocus ? 3 : isHover ? 1.5 : 1}
                />
                {/* left accent bar */}
                <rect x={n.x} y={n.y + 4} width={3} height={n.h - 8} rx={1.5} fill={color} opacity={0.9} />
                {/* war name */}
                <text x={n.x + n.w / 2 + 2} y={n.y + n.h / 2 - 6}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={n.fs} fontWeight="600" fill="#f1f5f9"
                  style={{ pointerEvents: 'none' }}>
                  {n.war.name.length > 14 ? n.war.name.slice(0, 13) + '…' : n.war.name}
                </text>
                {/* year */}
                <text x={n.x + n.w / 2 + 2} y={n.y + n.h / 2 + 8}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={n.fs - 2} fill="#94a3b8"
                  style={{ pointerEvents: 'none' }}>
                  {yr}{yrEnd}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
