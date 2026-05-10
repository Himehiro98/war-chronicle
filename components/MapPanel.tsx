'use client';

import { War } from '@/lib/types';

interface Props {
  selectedWar: War | null;
}

// SVG viewBox 320×260
// マーカー座標との整合性:
// 欧州: x=150-220, y=12-68 / 北米: x=85-135, y=45-165
// アジア: x=215-315, y=12-125 / アフリカ+中東: x=134-248, y=58-192
// 南米: x=68-136, y=180-260
const PATHS = {
  'north-america':
    'M28,30 L36,20 L46,14 L60,10 L76,10 L93,12 L108,16 L122,22 L132,32 L138,44 L137,58 L132,72 L126,86 L118,100 L110,112 L100,122 L89,130 L82,140 L85,150 L92,158 L102,164 L112,170 L118,162 L118,150 L113,140 L116,128 L122,114 L128,98 L132,82 L133,65 L130,50 L122,36 L110,24 L94,18 L77,16 L60,17 L45,22 L34,28 Z',
  'central-america':
    'M108,170 L116,170 L120,178 L116,188 L108,192 L99,187 L96,178 L100,170 Z',
  'south-america':
    'M85,195 L96,187 L110,183 L123,186 L133,196 L137,212 L134,230 L126,244 L114,254 L100,258 L86,254 L74,243 L68,228 L68,212 L72,198 Z',
  'europe':
    'M152,50 L150,41 L152,33 L156,26 L162,20 L168,16 L176,13 L185,11 L195,11 L206,14 L214,20 L220,28 L220,38 L217,48 L210,57 L200,64 L187,67 L174,66 L163,61 L155,53 Z',
  'scandinavia':
    'M166,16 L172,9 L179,6 L185,9 L188,16 L185,24 L180,29 L173,30 L167,24 L164,18 Z',
  'british-isles':
    'M152,22 L158,18 L164,22 L163,31 L156,35 L150,30 L149,24 Z',
  'iberia':
    'M148,47 L157,43 L164,47 L162,58 L153,64 L143,59 L141,50 Z',
  'italy':
    'M178,51 L185,48 L189,56 L187,67 L180,72 L173,65 L172,55 Z',
  'africa':
    'M143,72 L155,64 L168,62 L182,62 L194,67 L204,76 L212,89 L216,106 L218,125 L218,146 L214,165 L206,178 L194,187 L178,192 L162,190 L147,181 L136,164 L132,146 L131,125 L133,105 L137,87 L141,76 Z',
  'arabia':
    'M212,64 L226,60 L236,64 L240,75 L237,88 L226,98 L212,100 L204,93 L202,79 L206,68 Z',
  'asia':
    'M220,20 L238,14 L258,10 L278,10 L296,14 L310,22 L316,35 L315,50 L310,65 L300,78 L284,88 L266,92 L248,88 L232,80 L220,68 L215,52 L215,36 Z',
  'india':
    'M232,82 L250,78 L266,82 L272,97 L268,113 L256,124 L242,128 L227,121 L222,106 L224,90 Z',
  'se-asia':
    'M262,87 L280,82 L296,84 L307,94 L308,108 L298,120 L280,124 L263,116 L256,102 L258,89 Z',
  'japan':
    'M298,26 L306,23 L312,30 L310,40 L303,47 L297,43 L294,34 Z',
  'australia':
    'M268,154 L290,146 L311,150 L318,164 L315,181 L303,191 L284,195 L266,191 L254,178 L252,163 L260,153 Z',
};

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
    path: 'M198,14 L234,12 L244,22 L240,36 L232,46 L218,52 L202,50 L196,38 L196,24 Z',
    label: '東ヨーロッパ・ロシア西部',
  },
  'crimea': {
    path: 'M200,36 L226,33 L232,43 L222,52 L202,50 Z',
    label: 'クリミア・黒海',
  },
  'middle-east': {
    path: 'M143,72 L205,68 L212,88 L248,62 L244,88 L228,100 L215,108 L218,128 L216,148 L212,166 L202,180 L182,192 L160,190 L146,180 L132,162 L130,140 L132,110 L136,86 L140,76 Z',
    label: '中東・アフリカ',
  },
  'east-asia': {
    path: 'M258,22 L312,20 L318,50 L310,68 L285,90 L260,92 L254,68 L254,40 Z',
    label: '東アジア',
  },
  'southeast-asia': {
    path: 'M258,85 L308,82 L310,110 L296,124 L260,120 L252,102 Z',
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
      <div className="flex-1 relative overflow-hidden" style={{ background: '#b8d4e4' }}>
        <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <marker id="arr-map" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#2d7a6e" strokeWidth="1.5" strokeLinecap="round" />
            </marker>
          </defs>

          {/* ── 大陸シルエット ── */}
          <path d={PATHS['north-america']}  fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.7" />
          <path d={PATHS['central-america']} fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.6" />
          <path d={PATHS['south-america']}  fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.7" />
          <path d={PATHS['europe']}          fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.7" />
          <path d={PATHS['scandinavia']}     fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['british-isles']}   fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['iberia']}          fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['italy']}           fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['africa']}          fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.7" />
          <path d={PATHS['arabia']}          fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['asia']}            fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.7" />
          <path d={PATHS['india']}           fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.6" />
          <path d={PATHS['se-asia']}         fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.5" />
          <path d={PATHS['japan']}           fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.4" />
          <path d={PATHS['australia']}       fill="#d8cfa8" stroke="#9a8860" strokeWidth="0.6" />

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

          {/* 概略表示ラベル */}
          <text x="20" y="257" fontSize="7" fill="#7a6e5c" fontFamily="serif">概略図</text>
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
