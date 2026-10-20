'use client';

import { useMemo } from 'react';
import type { War } from '@/lib/types';
import { REGIONS } from '@/lib/wars';

type RenderItem =
  | { kind: 'year'; year: number; wars: War[] }
  | { kind: 'skip'; from: number; to: number; gap: number };

const fy = (y: number) => (y < 0 ? `前${-y}` : `${y}`);

const TYPE_CLASS: Record<string, string> = { war: 'is-war', revolution: 'is-revolution', colonial: 'is-colonial' };

/**
 * スパース年表：戦争のある年だけを並べ、5年を超える空白は折りたたむ。
 * PC は地域ごとの4列、スマホ（compact）は1列リスト。
 */
export default function Timeline({ wars, selectedId, onSelect, compact, searching }: {
  wars: War[];
  selectedId: string | null;
  onSelect: (w: War) => void;
  compact: boolean;
  searching: boolean;
}) {
  const items: RenderItem[] = useMemo(() => {
    const years = Array.from(new Set(wars.map((w) => w.year))).sort((a, b) => a - b);
    const out: RenderItem[] = [];
    years.forEach((year, i) => {
      if (i > 0) {
        const gap = year - years[i - 1];
        if (gap > 5 && !searching) out.push({ kind: 'skip', from: years[i - 1] + 1, to: year - 1, gap: gap - 1 });
      }
      out.push({ kind: 'year', year, wars: wars.filter((w) => w.year === year) });
    });
    return out;
  }, [wars, searching]);

  if (items.length === 0) {
    return <div className="tl-empty">条件に合う戦争が見つかりませんでした。</div>;
  }

  const card = (w: War) => (
    <button
      key={w.id}
      type="button"
      className={`tl-card ${TYPE_CLASS[w.type] ?? ''}${selectedId === w.id ? ' is-selected' : ''}`}
      onClick={() => onSelect(w)}
      aria-pressed={selectedId === w.id}
    >
      <span className="tl-card__name">{w.name}</span>
      <span className="tl-card__year">
        {w.year === w.endYear ? fy(w.year) : `${fy(w.year)}–${w.ongoing ? '継続中' : fy(w.endYear)}`}
        {compact && <span className="tl-card__region">{REGIONS[w.region]}</span>}
      </span>
    </button>
  );

  return (
    <div className={`tl${compact ? ' tl--compact' : ''}`}>
      {!compact && (
        <div className="tl-head">
          <div className="tl-yearcol" />
          {REGIONS.map((r) => <div key={r} className="tl-head__cell">{r}</div>)}
        </div>
      )}
      <div className="tl-scroll">
        {items.map((it, idx) =>
          it.kind === 'skip' ? (
            <div key={`s${idx}`} className="tl-skip">
              {fy(it.from)}〜{fy(it.to)}年（{it.gap.toLocaleString()}年間）は該当なし
            </div>
          ) : (
            <div key={`y${it.year}`} className="tl-row" data-year={it.year}>
              <div className="tl-yearcol">{fy(it.year)}</div>
              {compact ? (
                <div className="tl-cell">{it.wars.map(card)}</div>
              ) : (
                ([0, 1, 2, 3] as const).map((r) => (
                  <div key={r} className="tl-cell">{it.wars.filter((w) => w.region === r).map(card)}</div>
                ))
              )}
            </div>
          ),
        )}
      </div>
      <div className="tl-legend" aria-hidden>
        <span className="tl-legend__item is-war">戦争</span>
        <span className="tl-legend__item is-revolution">革命・内戦</span>
        <span className="tl-legend__item is-colonial">植民地戦争</span>
      </div>
    </div>
  );
}
