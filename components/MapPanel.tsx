'use client';

import { useState, useCallback, useEffect } from 'react';
import { War } from '@/lib/types';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Props {
  selectedWar: War | null;
}

export default function MapPanel({ selectedWar }: Props) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([20, 20]);

  // 戦争を選んだら、その舞台に寄せる
  useEffect(() => {
    if (!selectedWar || selectedWar.markers.length === 0) return;
    const xs = selectedWar.markers.map((m) => m.coordinates[0]);
    const ys = selectedWar.markers.map((m) => m.coordinates[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * 1.6, 8);
    setCenter([cx, cy]);
    setZoom(Math.max(1, Math.min(6, 160 / span)));
  }, [selectedWar]);

  const handleMoveEnd = useCallback(({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
    setZoom(z);
    setCenter(coordinates);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => {
      const next = e.deltaY < 0 ? prev * 1.2 : prev / 1.2;
      return Math.max(1, Math.min(12, next));
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setCenter([20, 20]);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
      {/* ヘッダー */}
      <div className="flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', padding: '8px 14px', minHeight: 44 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {selectedWar ? `${selectedWar.name}の主な舞台` : '年表から戦争を選ぶと、舞台が地図に表示されます'}
        </div>
        {zoom > 1.05 && (
          <button onClick={resetZoom} className="btn btn--ghost btn--sm" style={{ minHeight: 30, padding: '2px 10px', fontSize: 12 }}>
            全体表示
          </button>
        )}
      </div>

      {/* 地図 */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#b8d4e4' }}
        onWheel={handleWheel}>
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button aria-label="拡大" onClick={() => setZoom(z => Math.min(12, z * 1.3))}
            style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(42,34,24,0.3)', background: '#f5f0e8', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          <button aria-label="縮小" onClick={() => setZoom(z => Math.max(1, z / 1.3))}
            style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(42,34,24,0.3)', background: '#f5f0e8', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 5, fontSize: 11, color: 'rgba(42,34,24,0.4)', pointerEvents: 'none' }}>
          スクロールで拡大・ドラッグで移動
        </div>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 110, center: [20, 20] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={zoom} center={center} onMoveEnd={handleMoveEnd}
            minZoom={1} maxZoom={12}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#d8cfa8"
                    stroke="#9a8860"
                    strokeWidth={0.5 / zoom}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#cfc69a' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>

            {selectedWar?.markers.map((m, i) => (
              <Marker key={i} coordinates={m.coordinates}>
                <circle
                  r={(m.isMain ? 5 : 3) / Math.sqrt(zoom)}
                  fill={m.ally ? '#2d7a6e' : m.enemy ? '#b8860b' : '#8b3a1e'}
                  opacity={m.isMain ? 1 : 0.85}
                  style={{ pointerEvents: 'none' }}
                />
                {m.isMain && (
                  <circle
                    r={8 / Math.sqrt(zoom)}
                    fill="none"
                    stroke="#8b3a1e"
                    strokeWidth={1.5 / zoom}
                    strokeDasharray={`${2 / zoom} ${2 / zoom}`}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                <text
                  x={9 / Math.sqrt(zoom)}
                  y={3 / Math.sqrt(zoom)}
                  fontSize={6.5 / Math.sqrt(zoom)}
                  fill="#2a2218"
                  fontFamily="serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {m.label}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* 凡例 */}
      <div className="flex-shrink-0 flex gap-3 flex-wrap px-3.5 py-2"
        style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        {[
          { color: '#8b3a1e', label: '主要都市・決戦地' },
          { color: '#2d7a6e', label: '同盟・支援国' },
          { color: '#b8860b', label: '敵対国' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span className="text-ink-light" style={{ fontSize: 11, letterSpacing: '0.05em' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
