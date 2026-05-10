'use client';

import { War } from '@/lib/types';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Props {
  selectedWar: War | null;
}

export default function MapPanel({ selectedWar }: Props) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
      {/* ヘッダー */}
      <div className="flex-shrink-0 px-3.5 py-2.5"
        style={{ borderBottom: '1px solid rgba(42,34,24,0.15)', background: '#e8e0cc' }}>
        <div className="font-serif text-ink" style={{ fontSize: 13 }}>
          {selectedWar ? selectedWar.name : '戦争を選択してください'}
        </div>
        <div className="text-ink-light mt-0.5" style={{ fontSize: 10 }}>
          {selectedWar
            ? `${selectedWar.year}–${selectedWar.endYear} ／ ${selectedWar.theater}`
            : 'タイムラインのカードをクリック'}
        </div>
      </div>

      {/* 地図 */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#b8d4e4' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 110, center: [20, 20] }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#d8cfa8"
                  stroke="#9a8860"
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#d8cfa8' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>

          {selectedWar?.markers.map((m, i) => (
            <Marker key={i} coordinates={m.coordinates}>
              <circle
                r={m.isMain ? 5 : 3}
                fill={m.ally ? '#2d7a6e' : m.enemy ? '#b8860b' : '#8b3a1e'}
                opacity={m.isMain ? 1 : 0.85}
                style={{ pointerEvents: 'none' }}
              />
              {m.isMain && (
                <circle
                  r={8}
                  fill="none"
                  stroke="#8b3a1e"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <text
                x={8}
                y={3}
                fontSize={6.5}
                fill="#2a2218"
                fontFamily="serif"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {m.label}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* 凡例 */}
      <div className="flex-shrink-0 flex gap-3 flex-wrap px-3.5 py-2"
        style={{ borderTop: '1px solid rgba(42,34,24,0.15)', background: '#ede6d6' }}>
        {[
          { color: '#8b3a1e', label: '主要都市・決戦地' },
          { color: '#2d7a6e', label: '同盟・支援国' },
          { color: '#b8860b', label: '敵対国' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span className="text-ink-light" style={{ fontSize: 9, letterSpacing: '0.05em' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
