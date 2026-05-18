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
  0: '#1e40af',
  1: '#0891b2',
  2: '#b45309',
  3: '#7c3aed',
};

function sizeForWeight(weight: number | undefined) {
  const wt = weight ?? 1;
  if (wt === 3) return { w: 160, h: 56, fs: 12 };
  if (wt === 2) return { w: 130, h: 46, fs: 11 };
  return { w: 104, h: 38, fs: 10 };
}

function collectNeighbors(rootId: string, hops: number): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier: string[] = [rootId];
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

export default function CausalityGraph({ filterEra, filterTag, focusWarId }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 40, scale: 1 });
  const dragging = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  const { nodeList, edgeList, bounds } = useMemo(() => {
    let pool: War[] = WARS;
    if (focusWarId) {
      const ids = collectNeighbors(focusWarId, 2);
      pool = pool.filter((w) => ids.has(w.id));
    }
    if (filterEra && filterEra !== 'all') pool = pool.filter((w) => w.era === filterEra);
    if (filterTag && filterTag !== 'all') pool = pool.filter((w) => ((w.tags ?? []) as string[]).includes(filterTag));

    const idSet = new Set(pool.map((w) => w.id));
    const bucketCounts = new Map<string, number>();

    const nodeList = pool.map((w) => {
      const x = (w.year + 3000) * 1.6;
      const yearBucket = Math.floor(w.year / 25);
      const key = `${w.region}-${yearBucket}`;
      const slot = bucketCounts.get(key) ?? 0;
      bucketCounts.set(key, slot + 1);
      const baseY = w.region * 200;
      const y = baseY + slot * 68;
      const { w: nw, h: nh, fs } = sizeForWeight(w.weight);
      return { id: w.id, x, y, nw, nh, fs, name: w.name, year: w.year, endYear: w.endYear, region: w.region, color: REGION_COLORS[w.region], isFocus: focusWarId === w.id };
    });

    const edgeList: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const nodeMap = new Map(nodeList.map((n) => [n.id, n]));
    for (const w of pool) {
      for (const causeId of w.causes ?? []) {
        if (!idSet.has(causeId)) continue;
        const src = nodeMap.get(causeId);
        const dst = nodeMap.get(w.id);
        if (!src || !dst) continue;
        edgeList.push({
          id: `${causeId}->${w.id}`,
          x1: src.x + src.nw,
          y1: src.y + src.nh / 2,
          x2: dst.x,
          y2: dst.y + dst.nh / 2,
        });
      }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodeList) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.nw);
      maxY = Math.max(maxY, n.y + n.nh);
    }
    const bounds = nodeList.length ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 800, maxY: 600 };

    return { nodeList, edgeList, bounds };
  }, [filterEra, filterTag, focusWarId]);

  // Auto-fit on data change
  useEffect(() => {
    const el = svgRef.current;
    if (!el || nodeList.length === 0) return;
    const { width, height } = el.getBoundingClientRect();
    const contentW = bounds.maxX - bounds.minX + 80;
    const contentH = bounds.maxY - bounds.minY + 80;
    const scale = Math.min(width / contentW, height / contentH, 1.5);
    const tx = (width - contentW * scale) / 2 - bounds.minX * scale + 40 * scale;
    const ty = (height - contentH * scale) / 2 - bounds.minY * scale + 40 * scale;
    setTransform({ x: tx, y: ty, scale });
  }, [bounds, nodeList.length]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTransform((t) => {
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.05, Math.min(3, t.scale * factor));
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return t;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        scale: newScale,
        x: mx - (mx - t.x) * (newScale / t.scale),
        y: my - (my - t.y) * (newScale / t.scale),
      };
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setTransform((t) => ({
      ...t,
      x: dragging.current!.tx + (e.clientX - dragging.current!.startX),
      y: dragging.current!.ty + (e.clientY - dragging.current!.startY),
    }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = null; }, []);

  const handleNodeClick = useCallback((warId: string) => {
    router.push(`/explore?war=${warId}`);
  }, [router]);

  const yearLabel = (w: number | undefined, ey: number | undefined) => {
    if (!w) return '';
    const s = w < 0 ? `BC${-w}` : `${w}`;
    if (!ey || ey === w) return s;
    return `${s}–${ey < 0 ? 'BC' + (-ey) : ey}`;
  };

  if (nodeList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-50 rounded-lg border border-slate-200">
        <p className="text-slate-400 text-sm">該当する戦争がありません</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-stone-50 rounded-lg border border-slate-200 overflow-hidden select-none">
      {/* zoom buttons */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
        {['+', '−', '⤢'].map((icon, i) => (
          <button
            key={icon}
            onClick={() => {
              if (i === 2) {
                const el = svgRef.current;
                if (!el || nodeList.length === 0) return;
                const { width, height } = el.getBoundingClientRect();
                const contentW = bounds.maxX - bounds.minX + 80;
                const contentH = bounds.maxY - bounds.minY + 80;
                const scale = Math.min(width / contentW, height / contentH, 1.5);
                const tx = (width - contentW * scale) / 2 - bounds.minX * scale + 40 * scale;
                const ty = (height - contentH * scale) / 2 - bounds.minY * scale + 40 * scale;
                setTransform({ x: tx, y: ty, scale });
              } else {
                setTransform((t) => ({ ...t, scale: Math.max(0.05, Math.min(3, t.scale * (i === 0 ? 1.2 : 0.8))) }));
              }
            }}
            className="w-7 h-7 bg-white border border-slate-300 rounded text-slate-600 text-sm hover:bg-slate-100 flex items-center justify-center shadow-sm"
          >{icon}</button>
        ))}
      </div>

      {/* tooltip */}
      {tooltip && (
        <div className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs px-2 py-1 rounded shadow"
          style={{ left: tooltip.x + 8, top: tooltip.y - 28 }}>
          {tooltip.name}
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
          </marker>
        </defs>
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* edges */}
          {edgeList.map((e) => (
            <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#94a3b8" strokeWidth={1.2} opacity={0.6} markerEnd="url(#arrow)" />
          ))}
          {/* nodes */}
          {nodeList.map((n) => (
            <g key={n.id}
              onClick={() => handleNodeClick(n.id)}
              onMouseEnter={(e) => {
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: n.name });
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={n.x} y={n.y} width={n.nw} height={n.nh} rx={6}
                fill={n.color}
                stroke={n.isFocus ? '#facc15' : 'rgba(255,255,255,0.25)'}
                strokeWidth={n.isFocus ? 3 : 1}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
              <foreignObject x={n.x + 2} y={n.y + 2} width={n.nw - 4} height={n.nh - 4}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif', textAlign: 'center' }}>
                  <div style={{ fontSize: n.fs, fontWeight: 600, lineHeight: 1.2, wordBreak: 'break-all' }}>{n.name}</div>
                  <div style={{ fontSize: n.fs - 1.5, opacity: 0.85, marginTop: 1 }}>{yearLabel(n.year, n.endYear)}</div>
                </div>
              </foreignObject>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
