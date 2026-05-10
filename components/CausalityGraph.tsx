'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WARS } from '@/lib/wars';
import type { War, RegionId } from '@/lib/types';

interface Props {
  filterEra?: string;
  filterTag?: string;
  focusWarId?: string;
}

const REGION_COLORS: Record<RegionId, string> = {
  0: '#1e40af', // 欧州
  1: '#0891b2', // アジア
  2: '#b45309', // 中東・アフリカ
  3: '#7c3aed', // 南北米
};

const REGION_LABELS: Record<RegionId, string> = {
  0: '欧州',
  1: 'アジア',
  2: '中東・アフリカ',
  3: '南北米',
};

function sizeForWeight(weight: number | undefined): { w: number; h: number; fontSize: number } {
  const wt = weight ?? 1;
  if (wt === 3) return { w: 180, h: 64, fontSize: 13 };
  if (wt === 2) return { w: 140, h: 50, fontSize: 11 };
  return { w: 110, h: 40, fontSize: 10 };
}

function collectNeighbors(rootId: string, hops: number): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier: string[] = [rootId];
  for (let i = 0; i < hops; i++) {
    const next: string[] = [];
    for (const id of frontier) {
      const w = WARS.find((x) => x.id === id);
      if (!w) continue;
      const neighbors = [...(w.causes ?? []), ...(w.influences ?? [])];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          next.push(n);
        }
      }
      // Also include wars that mention this id
      for (const other of WARS) {
        if (visited.has(other.id)) continue;
        if ((other.causes ?? []).includes(id) || (other.influences ?? []).includes(id)) {
          visited.add(other.id);
          next.push(other.id);
        }
      }
    }
    frontier = next;
  }
  return visited;
}

export default function CausalityGraph({ filterEra, filterTag, focusWarId }: Props) {
  const router = useRouter();

  const { nodes, edges } = useMemo(() => {
    let pool: War[] = WARS;

    if (focusWarId) {
      const ids = collectNeighbors(focusWarId, 2);
      pool = pool.filter((w) => ids.has(w.id));
    }
    if (filterEra && filterEra !== 'all') {
      pool = pool.filter((w) => w.era === filterEra);
    }
    if (filterTag && filterTag !== 'all') {
      pool = pool.filter((w) => ((w.tags ?? []) as string[]).includes(filterTag));
    }

    const idSet = new Set(pool.map((w) => w.id));

    // Group by region+year-bucket to avoid overlap
    const bucketCounts = new Map<string, number>();

    const nodes: Node[] = pool.map((w) => {
      // 原点を BC3000 にシフトし、5000年を約7000pxに圧縮
      const x = (w.year + 3000) * 1.4;
      const yearBucket = Math.floor(w.year / 25);
      const key = `${w.region}-${yearBucket}`;
      const slot = bucketCounts.get(key) ?? 0;
      bucketCounts.set(key, slot + 1);

      const baseY = w.region * 220;
      const y = baseY + slot * 70;

      const { w: nw, h: nh, fontSize } = sizeForWeight(w.weight);
      const color = REGION_COLORS[w.region];

      return {
        id: w.id,
        position: { x, y },
        data: {
          label: (
            <div
              style={{
                fontSize,
                lineHeight: 1.2,
                color: '#fff',
                fontWeight: 600,
                textAlign: 'center',
                padding: '4px 6px',
              }}
            >
              <div>{w.name}</div>
              <div style={{ fontSize: fontSize - 2, opacity: 0.85, fontWeight: 400 }}>
                {w.year < 0 ? `BC${-w.year}` : w.year}
                {w.endYear && w.endYear !== w.year ? `–${w.endYear < 0 ? 'BC' + (-w.endYear) : w.endYear}` : ''}
              </div>
            </div>
          ),
        },
        style: {
          width: nw,
          height: nh,
          background: color,
          border: focusWarId === w.id ? '3px solid #facc15' : '1px solid rgba(255,255,255,0.3)',
          borderRadius: 8,
          padding: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const edges: Edge[] = [];
    for (const w of pool) {
      for (const causeId of w.causes ?? []) {
        if (!idSet.has(causeId)) continue;
        edges.push({
          id: `${causeId}->${w.id}`,
          source: causeId,
          target: w.id,
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 1.5, opacity: 0.7 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748b',
          },
        });
      }
    }

    return { nodes, edges };
  }, [filterEra, filterTag, focusWarId]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      router.push(`/explore?war=${node.id}`);
    },
    [router]
  );

  return (
    <div className="w-full h-full bg-stone-50 rounded-lg border border-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={24} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const w = WARS.find((x) => x.id === n.id);
            return w ? REGION_COLORS[w.region] : '#94a3b8';
          }}
          maskColor="rgba(15, 23, 42, 0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
