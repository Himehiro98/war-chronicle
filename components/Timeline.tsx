'use client';

import { War, EraId } from '@/lib/types';
import { WARS, REGIONS, ERA_CONFIG } from '@/lib/wars';

const TYPE_STYLES: Record<string, string> = {
  war:        'bg-rust-pale border-l-rust',
  revolution: 'bg-teal-pale border-l-teal',
  colonial:   'bg-gold-pale border-l-gold',
};

interface Props {
  selectedId: string | null;
  onSelect: (war: War) => void;
  activeEra: EraId;
  activeRegion: string;
  width: number; // percentage
}

export default function Timeline({ selectedId, onSelect, activeEra, activeRegion, width }: Props) {
  const { start, end } = ERA_CONFIG[activeEra];
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const eraWars = WARS.filter((w) => {
    if (w.era !== activeEra) return false;
    if (activeRegion === '全て') return true;
    return REGIONS[w.region] === activeRegion;
  });

  return (
    <div className="flex flex-col h-full" style={{ width: `${width}%`, flexShrink: 0, borderRight: '1px solid rgba(42,34,24,0.3)' }}>
      {/* 地域ヘッダー */}
      <div className="flex flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(42,34,24,0.3)', background: '#e8e0cc' }}>
        <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid rgba(42,34,24,0.15)' }} />
        {REGIONS.map((r) => (
          <div key={r} className="flex-1 text-center py-1.5 text-ink-light font-body"
            style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRight: '1px solid rgba(42,34,24,0.15)' }}>
            {r}
          </div>
        ))}
      </div>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {years.map((year) => {
          const isDec = year % 10 === 0;
          const warsThisYear = eraWars.filter((w) => w.year === year);

          return (
            <div key={year} className="flex"
              style={{
                minHeight: 36,
                borderTop: isDec ? '1px solid rgba(42,34,24,0.3)' : undefined,
              }}>
              {/* 年ラベル */}
              <div className="flex-shrink-0 flex items-start justify-end pr-1.5"
                style={{ width: 52, borderRight: '1px solid rgba(42,34,24,0.15)', paddingTop: 6 }}>
                <span
                  className={isDec ? 'text-ink-mid font-semibold' : 'text-ink-light'}
                  style={{ fontSize: isDec ? 10 : 9, letterSpacing: '0.05em' }}>
                  {year}
                </span>
              </div>

              {/* 地域セル */}
              <div className="flex flex-1">
                {([0, 1, 2, 3] as const).map((region) => {
                  const regionWars = warsThisYear.filter((w) => w.region === region);
                  return (
                    <div key={region} className="flex-1 p-1"
                      style={{ borderRight: region < 3 ? '1px solid rgba(42,34,24,0.15)' : undefined, minHeight: 36 }}>
                      {regionWars.map((war) => (
                        <button
                          key={war.id}
                          onClick={() => onSelect(war)}
                          className={`w-full text-left rounded border-l-[3px] px-1.5 py-1 mb-0.5 transition-all duration-200 hover:translate-x-0.5 ${TYPE_STYLES[war.type]} ${selectedId === war.id ? 'shadow-[0_0_0_2px_#2a2218]' : ''}`}>
                          <div className="flex items-start gap-1">
                            <div className="font-semibold text-ink flex-1" style={{ fontSize: 9, lineHeight: 1.2 }}>
                              {war.name}
                            </div>
                            {war.cotenLinks && war.cotenLinks.length > 0 && (
                              <span style={{
                                fontSize: 7, padding: '1px 3px', borderRadius: 3,
                                background: '#e8611a', color: 'white', fontWeight: 700,
                                flexShrink: 0, lineHeight: 1.4,
                              }}>🎙</span>
                            )}
                          </div>
                          <div className="text-ink-light" style={{ fontSize: 8, marginTop: 1 }}>
                            {war.year}–{war.endYear}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
