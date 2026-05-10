'use client';

import { useRef, useCallback, useMemo } from 'react';
import { War, EraId } from '@/lib/types';
import { WARS, REGIONS, ERA_CONFIG } from '@/lib/wars';
import { useIsMobile } from '@/lib/useIsMobile';

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
  width: number;
}

type RenderItem =
  | { kind: 'year'; year: number; wars: War[] }
  | { kind: 'skip'; from: number; to: number; gap: number };

function formatYearLabel(y: number): string {
  return y < 0 ? `BC${-y}` : `${y}`;
}

export default function Timeline({ selectedId, onSelect, activeEra, activeRegion, width }: Props) {
  const { start, end } = ERA_CONFIG[activeEra];
  const isMobile = useIsMobile(768);

  const eraWars = WARS.filter((w) => {
    if (w.era !== activeEra) return false;
    if (activeRegion === '全て') return true;
    return REGIONS[w.region] === activeRegion;
  });

  // スパース・タイムライン：戦争のある年だけ + 空白マーカーで折りたたむ
  const renderItems: RenderItem[] = useMemo(() => {
    const warStartYears = Array.from(new Set(eraWars.map(w => w.year))).sort((a, b) => a - b);
    if (warStartYears.length === 0) return [];

    const items: RenderItem[] = [];
    warStartYears.forEach((year, i) => {
      if (i > 0) {
        const prev = warStartYears[i - 1];
        const gap = year - prev;
        // 5年以上の空白は折りたたむ
        if (gap > 5) {
          items.push({ kind: 'skip', from: prev + 1, to: year - 1, gap: gap - 1 });
        }
      }
      const wars = eraWars.filter(w => w.year === year);
      items.push({ kind: 'year', year, wars });
    });
    return items;
  }, [eraWars]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ジャンプ用：戦争のある世紀／代表年（最大10個程度）
  const jumpTargets: number[] = useMemo(() => {
    const yearSet = new Set(renderItems.filter((i): i is { kind: 'year'; year: number; wars: War[] } => i.kind === 'year').map(i => i.year));
    if (yearSet.size === 0) return [];
    const sorted = Array.from(yearSet).sort((a, b) => a - b);

    // エラの長さに応じて間引く
    const eraSpan = end - start;
    let bucket: number;
    if (eraSpan > 2000) bucket = 500;       // 先史
    else if (eraSpan > 800) bucket = 200;   // 古代・中世
    else if (eraSpan > 200) bucket = 50;    // 近世初期
    else if (eraSpan > 100) bucket = 25;    // 近世
    else bucket = 10;                       // 20世紀・現代

    // 各バケットの最初の戦争年を選ぶ
    const targets: number[] = [];
    let lastBucket = -Infinity;
    sorted.forEach(y => {
      const b = Math.floor(y / bucket);
      if (b !== lastBucket) {
        targets.push(y);
        lastBucket = b;
      }
    });
    return targets;
  }, [renderItems, start, end]);

  const scrollToYear = useCallback((year: number) => {
    if (!scrollRef.current) return;
    const target = scrollRef.current.querySelector(`[data-year="${year}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="flex h-full" style={{ width: `${width}%`, flexShrink: 0, borderRight: '1px solid rgba(42,34,24,0.3)' }}>

      {/* ── 左サイドバー（年代ジャンプ） ── */}
      <div className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 24, background: '#2a2218', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height: 28, flexShrink: 0 }} />
        <div className="flex-1 overflow-y-hidden flex flex-col justify-between py-1">
          {jumpTargets.length === 0 ? (
            <div style={{ fontSize: 8, color: 'rgba(245,240,232,0.3)', textAlign: 'center', padding: '8px 2px' }}>—</div>
          ) : (
            jumpTargets.map((y) => (
              <button
                key={y}
                onClick={() => scrollToYear(y)}
                title={`${formatYearLabel(y)}年へ`}
                style={{
                  fontSize: 7, color: 'rgba(245,240,232,0.55)', cursor: 'pointer',
                  background: 'none', border: 'none', padding: '1px 2px',
                  fontFamily: 'inherit', letterSpacing: '0.03em', lineHeight: 1.2,
                  writingMode: 'vertical-rl', textOrientation: 'mixed',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fbbf24')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.55)')}
              >
                {formatYearLabel(y)}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── 年表本体 ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 地域ヘッダー */}
        <div className="flex flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(42,34,24,0.3)', background: '#e8e0cc', height: isMobile ? 36 : 28 }}>
          <div style={{ width: isMobile ? 44 : 56, flexShrink: 0, borderRight: '1px solid rgba(42,34,24,0.15)' }} />
          {REGIONS.map((r) => (
            <div key={r} className="flex-1 text-center text-ink-light font-body flex items-center justify-center"
              style={{ fontSize: isMobile ? 11 : 9, letterSpacing: '0.05em', fontWeight: isMobile ? 600 : 400,
                borderRight: '1px solid rgba(42,34,24,0.15)' }}>
              {r}
            </div>
          ))}
        </div>

        {/* スクロールエリア（スパース） */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderItems.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9a8f7a', fontSize: 11 }}>
              この条件に合う戦争はないけん
            </div>
          ) : renderItems.map((item, idx) => {
            // ── 空白スキップ・マーカー ──
            if (item.kind === 'skip') {
              return (
                <div key={`skip-${idx}`} className="flex items-center justify-center"
                  style={{
                    minHeight: 28,
                    background: 'repeating-linear-gradient(135deg, rgba(42,34,24,0.04), rgba(42,34,24,0.04) 6px, rgba(42,34,24,0.08) 6px, rgba(42,34,24,0.08) 12px)',
                    borderTop: '1px dashed rgba(42,34,24,0.2)',
                    borderBottom: '1px dashed rgba(42,34,24,0.2)',
                    color: '#7a6e5c', fontSize: 9, letterSpacing: '0.08em',
                  }}>
                  ⋯ {item.gap.toLocaleString()}年の空白（{formatYearLabel(item.from)} 〜 {formatYearLabel(item.to)}） ⋯
                </div>
              );
            }

            // ── 戦争のある年 ──
            const isCenturyMark = item.year % 100 === 0;
            const rowMin = isMobile ? 52 : 36;
            return (
              <div key={`y-${item.year}`} data-year={item.year} className="flex"
                style={{
                  minHeight: rowMin,
                  borderTop: isCenturyMark ? '1px solid rgba(42,34,24,0.3)' : undefined,
                }}>
                {/* 年ラベル */}
                <div className="flex-shrink-0 flex items-start justify-end pr-1.5"
                  style={{ width: isMobile ? 44 : 56, borderRight: '1px solid rgba(42,34,24,0.15)', paddingTop: isMobile ? 8 : 6 }}>
                  <span className={isCenturyMark ? 'text-ink-mid font-semibold' : 'text-ink-light'}
                    style={{ fontSize: isMobile ? (isCenturyMark ? 12 : 11) : (isCenturyMark ? 10 : 9), letterSpacing: '0.04em' }}>
                    {formatYearLabel(item.year)}
                  </span>
                </div>

                {/* 地域セル */}
                <div className="flex flex-1">
                  {([0, 1, 2, 3] as const).map((region) => {
                    const regionWars = item.wars.filter((w) => w.region === region);
                    return (
                      <div key={region} className="flex-1 p-1"
                        style={{ borderRight: region < 3 ? '1px solid rgba(42,34,24,0.15)' : undefined, minHeight: rowMin }}>
                        {regionWars.map((war) => (
                          <button
                            key={war.id}
                            onClick={() => onSelect(war)}
                            className={`w-full text-left rounded border-l-[3px] mb-0.5 transition-all duration-200 hover:translate-x-0.5 ${TYPE_STYLES[war.type]} ${selectedId === war.id ? 'shadow-[0_0_0_2px_#2a2218]' : ''}`}
                            style={{ padding: isMobile ? '6px 7px' : '4px 6px', minHeight: isMobile ? 44 : 'auto' }}>
                            <div className="flex items-start gap-1">
                              <div className="font-semibold text-ink flex-1" style={{ fontSize: isMobile ? 12 : 9, lineHeight: 1.25 }}>
                                {war.name}
                              </div>
                              {war.cotenLinks && war.cotenLinks.length > 0 && (
                                <span style={{
                                  fontSize: isMobile ? 9 : 7, padding: isMobile ? '1px 4px' : '1px 3px', borderRadius: 3,
                                  background: '#e8611a', color: 'white', fontWeight: 700,
                                  flexShrink: 0, lineHeight: 1.4,
                                }}>🎙</span>
                              )}
                            </div>
                            <div className="text-ink-light" style={{ fontSize: isMobile ? 10 : 8, marginTop: 2 }}>
                              {formatYearLabel(war.year)}–{formatYearLabel(war.endYear)}
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
    </div>
  );
}
