'use client';

import { War } from '@/lib/types';

interface Props {
  selectedWar: War | null;
}

// SVG viewBox 320×260 の座標系
const PATHS = {
  'north-america':   'M60,20 L110,18 L130,30 L140,50 L135,80 L125,110 L110,140 L95,155 L75,160 L55,155 L40,140 L35,110 L38,80 L45,50 Z',
  'central-america': 'M95,155 L105,160 L100,175 L90,180 L82,175 L80,162 Z',
  'south-america':   'M85,185 L110,180 L125,195 L128,220 L120,240 L100,250 L82,245 L72,228 L70,205 L75,190 Z',
  'europe':          'M158,15 L185,12 L200,20 L205,35 L195,50 L185,60 L170,65 L158,58 L150,45 L152,28 Z',
  'scandinavia':     'M168,8 L175,5 L180,12 L175,18 L168,15 Z',
  'africa':          'M155,75 L180,70 L198,80 L208,100 L210,130 L205,158 L190,175 L170,180 L152,172 L142,155 L140,128 L142,100 L148,82 Z',
  'asia':            'M205,15 L250,10 L285,20 L305,35 L308,60 L295,75 L270,82 L245,80 L225,70 L210,55 L205,38 Z',
  'india':           'M245,80 L262,78 L272,95 L268,115 L252,120 L238,112 L234,94 Z',
  'se-asia':         'M275,80 L290,82 L298,95 L288,105 L275,100 Z',
};

// ハイライト用のクリップパス（戦域を示す）
const HIGHLIGHT_DEFS: Record<string, { path: string; label: string }> = {
  'north-america': {
    path: PATHS['north-america'],
    label: '北アメリカ',
  },
  'europe': {
    path: PATHS['europe'],
    label: 'ヨーロッパ',
  },
  'eastern-europe': {
    // ロシア西部〜東欧
    path: 'M198,15 L230,12 L240,25 L235,40 L220,45 L200,42 L195,30 Z',
    label: '東ヨーロッパ',
  },
  'crimea': {
    // 黒海沿岸
    path: 'M200,35 L225,33 L228,42 L218,48 L200,46 Z',
    label: 'クリミア・黒海',
  },
  'middle-east': {
    // 中東
    path: 'M195,55 L235,53 L242,65 L238,80 L220,85 L198,80 L193,68 Z',
    label: '中東',
  },
  'east-asia': {
    // 東アジア（日本・朝鮮・中国東部）
    path: 'M262,30 L305,28 L310,65 L295,80 L268,78 L258,60 Z',
    label: '東アジア',
  },
  'southeast-asia': {
    // 東南アジア（ベトナム・カンボジア等）
    path: 'M262,58 L295,55 L300,90 L285,108 L265,105 L258,80 Z',
    label: '東南アジア',
  },
  'south-asia': {
    path: PATHS['india'],
    label: '南アジア',
  },
};

export default function MapPanel({ selectedWar }: Props) {
  const hl = selectedWar ? HIGHLIGHT_DEFS[selectedWar.mapHighlight] : null;

  return (
    <div className="flex flex-col overflow-hidden" style={{ width: '35%' }}>
      {/* ヘッダー */}
      <div className="flex-shrink-0 px-3.5 py-2.5" style={{ borderBottom: '1px solid rgba(42,34,24,0.15)', background: '#e8e0cc' }}>
        <div className="font-serif text-ink" style={{ fontSize: 13 }}>
          {selectedWar ? selectedWar.name : '戦争を選択してください'}
        </div>
        <div className="text-ink-light mt-0.5" style={{ fontSize: 10 }}>
          {selectedWar
            ? `${selectedWar.year}–${selectedWar.endYear} ／ ${selectedWar.theater}`
            : 'タイムラインのカードをクリック'}
        </div>
      </div>

      {/* SVG地図 */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#c8dde8' }}>
        <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <marker id="arr-map" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#2d7a6e" strokeWidth="1.5" strokeLinecap="round" />
            </marker>
          </defs>

          {/* ── 大陸シルエット ── */}
          <path d={PATHS['north-america']}  fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['central-america']} fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['south-america']}  fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['europe']}          fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['scandinavia']}     fill="#d4c9a8" stroke="#a09070" strokeWidth="0.5" />
          <path d={PATHS['africa']}          fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['asia']}            fill="#d4c9a8" stroke="#a09070" strokeWidth="0.8" />
          <path d={PATHS['india']}           fill="#d4c9a8" stroke="#a09070" strokeWidth="0.6" />
          <path d={PATHS['se-asia']}         fill="#d4c9a8" stroke="#a09070" strokeWidth="0.5" />

          {/* ── 戦域ハイライト ── */}
          {hl && (
            <path
              d={hl.path}
              fill="#c4623a"
              fillOpacity="0.28"
              stroke="#8b3a1e"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* ── 仏→米 支援矢印（独立戦争） ── */}
          {selectedWar?.id === 'american-independence' && (
            <path d="M168,44 Q140,55 115,65" fill="none" stroke="#2d7a6e" strokeWidth="1"
              strokeDasharray="3 2" markerEnd="url(#arr-map)" />
          )}

          {/* ── マーカー ── */}
          {selectedWar?.markers.map((m, i) => (
            <g key={i}>
              <circle
                cx={m.cx} cy={m.cy}
                r={m.isMain ? 5 : 3}
                fill={m.ally ? '#2d7a6e' : m.enemy ? '#b8860b' : '#8b3a1e'}
                opacity={m.isMain ? 1 : 0.85}
              />
              {m.isMain && (
                <circle cx={m.cx} cy={m.cy} r={8}
                  fill="none" stroke="#8b3a1e" strokeWidth="1.5" strokeDasharray="2 2" />
              )}
              <text x={m.cx + 6} y={m.cy + 3} fontSize="6.5" fill="#2a2218" fontFamily="serif">
                {m.label}
              </text>
            </g>
          ))}

          {/* スケールバー */}
          <line x1="20" y1="248" x2="70" y2="248" stroke="#2a2218" strokeWidth="1" strokeOpacity="0.5" />
          <text x="33" y="257" fontSize="7" fill="#7a6e5c" fontFamily="serif">概略図</text>
        </svg>
      </div>

      {/* 凡例 */}
      <div className="flex-shrink-0 flex gap-3 flex-wrap px-3.5 py-2"
        style={{ borderTop: '1px solid rgba(42,34,24,0.15)', background: '#ede6d6' }}>
        {[
          { color: '#c4623a', opacity: 0.7, label: '主戦場' },
          { color: '#8b3a1e', opacity: 1,   label: '主要都市・決戦地' },
          { color: '#2d7a6e', opacity: 1,   label: '同盟・支援国' },
          { color: '#b8860b', opacity: 1,   label: '敵対国' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color, opacity: l.opacity }} />
            <span className="text-ink-light" style={{ fontSize: 9, letterSpacing: '0.05em' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
