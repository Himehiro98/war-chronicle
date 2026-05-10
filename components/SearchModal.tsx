'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { WARS, REGIONS, ERA_CONFIG } from '@/lib/wars';
import { War, EraId, RegionId, WarType } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (war: War) => void;
}

type EraFilter = 'all' | EraId;
type RegionFilter = 'all' | RegionId;
type TypeFilter = 'all' | WarType;

const COLORS = {
  bg: '#f5f0e8',
  panel: '#fafaf9',
  rust: '#8b3a1e',
  teal: '#1a4a42',
  gold: '#b8860b',
  text: '#2a2218',
  textSub: '#6b5d4f',
  border: '#d8cfbf',
  hover: '#f0e9dc',
};

const ERA_OPTIONS: { id: EraFilter; label: string }[] = [
  { id: 'all', label: '全て' },
  { id: 'early-modern', label: '近世' },
  { id: '20th-century', label: '20世紀' },
  { id: 'contemporary', label: '現代' },
];

const REGION_OPTIONS: { id: RegionFilter; label: string }[] = [
  { id: 'all', label: '全て' },
  { id: 0, label: '欧州' },
  { id: 1, label: 'アジア' },
  { id: 2, label: '中東・アフリカ' },
  { id: 3, label: '南北米' },
];

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: '全て' },
  { id: 'war', label: '戦争' },
  { id: 'revolution', label: '革命' },
  { id: 'colonial', label: '植民地' },
];

const TYPE_LABEL: Record<WarType, string> = {
  war: '戦争',
  revolution: '革命',
  colonial: '植民地',
};

const REGION_BADGE_COLOR: Record<RegionId, string> = {
  0: '#1a4a42',
  1: '#8b3a1e',
  2: '#b8860b',
  3: '#3a5a8b',
};

const MIN_YEAR = ERA_CONFIG['early-modern'].start;
const MAX_YEAR = ERA_CONFIG['contemporary'].end;

export default function SearchModal({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [yearStart, setYearStart] = useState<number>(MIN_YEAR);
  const [yearEnd, setYearEnd] = useState<number>(MAX_YEAR);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WARS.filter((w) => {
      if (q) {
        const hit =
          w.name.toLowerCase().includes(q) ||
          w.theater.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (eraFilter !== 'all' && w.era !== eraFilter) return false;
      if (regionFilter !== 'all' && w.region !== regionFilter) return false;
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (w.endYear < yearStart || w.year > yearEnd) return false;
      return true;
    });
  }, [query, eraFilter, regionFilter, typeFilter, yearStart, yearEnd]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query, eraFilter, regionFilter, typeFilter, yearStart, yearEnd]);

  // Autofocus & reset on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // soft reset
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        if (filtered[activeIndex]) {
          e.preventDefault();
          onSelect(filtered[activeIndex]);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, activeIndex, onClose, onSelect]);

  // Scroll active row into view
  useEffect(() => {
    if (!listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(
      `[data-row-index="${activeIndex}"]`
    );
    if (row) row.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const Chip = <T extends string | number>({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full transition-colors"
      style={{
        padding: '4px 12px',
        fontSize: 11,
        fontWeight: 600,
        background: active ? COLORS.rust : 'transparent',
        color: active ? '#fff' : COLORS.text,
        border: `1px solid ${active ? COLORS.rust : COLORS.border}`,
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{
        background: 'rgba(20, 16, 10, 0.55)',
        backdropFilter: 'blur(2px)',
        paddingTop: '6vh',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-lg flex flex-col"
        style={{
          width: 'min(700px, 92vw)',
          maxHeight: '80vh',
          background: COLORS.panel,
          color: COLORS.text,
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          border: `1px solid ${COLORS.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: COLORS.text,
            }}
          >
            戦争を検索
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              fontSize: 22,
              lineHeight: 1,
              color: COLORS.textSub,
              padding: '0 6px',
            }}
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="戦争名・地域・年代で検索..."
            className="w-full rounded"
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: '#fff',
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              outline: 'none',
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span style={{ fontSize: 10, color: COLORS.textSub, fontWeight: 700, width: 40 }}>
              時代
            </span>
            {ERA_OPTIONS.map((o) => (
              <Chip
                key={String(o.id)}
                active={eraFilter === o.id}
                onClick={() => setEraFilter(o.id)}
              >
                {o.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span style={{ fontSize: 10, color: COLORS.textSub, fontWeight: 700, width: 40 }}>
              地域
            </span>
            {REGION_OPTIONS.map((o) => (
              <Chip
                key={String(o.id)}
                active={regionFilter === o.id}
                onClick={() => setRegionFilter(o.id)}
              >
                {o.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span style={{ fontSize: 10, color: COLORS.textSub, fontWeight: 700, width: 40 }}>
              種類
            </span>
            {TYPE_OPTIONS.map((o) => (
              <Chip
                key={String(o.id)}
                active={typeFilter === o.id}
                onClick={() => setTypeFilter(o.id)}
              >
                {o.label}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: COLORS.textSub, fontWeight: 700, width: 40 }}>
              年代
            </span>
            <input
              type="number"
              value={yearStart}
              min={MIN_YEAR}
              max={MAX_YEAR}
              onChange={(e) => setYearStart(Number(e.target.value) || MIN_YEAR)}
              className="rounded"
              style={{
                width: 80,
                padding: '4px 8px',
                fontSize: 12,
                background: '#fff',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
            <span style={{ fontSize: 11, color: COLORS.textSub }}>〜</span>
            <input
              type="number"
              value={yearEnd}
              min={MIN_YEAR}
              max={MAX_YEAR}
              onChange={(e) => setYearEnd(Number(e.target.value) || MAX_YEAR)}
              className="rounded"
              style={{
                width: 80,
                padding: '4px 8px',
                fontSize: 12,
                background: '#fff',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            />
            <span style={{ fontSize: 10, color: COLORS.textSub, marginLeft: 'auto' }}>
              {filtered.length}件ヒット
            </span>
          </div>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            flex: 1,
            background: COLORS.bg,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: COLORS.textSub,
                fontSize: 13,
              }}
            >
              該当する戦争が見つからんかった
            </div>
          ) : (
            filtered.map((w, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={w.id}
                  type="button"
                  data-row-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelect(w);
                    onClose();
                  }}
                  className="w-full text-left transition-colors"
                  style={{
                    padding: '10px 18px',
                    borderBottom: `1px solid ${COLORS.border}`,
                    background: isActive ? COLORS.hover : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: COLORS.text,
                        marginBottom: 3,
                      }}
                    >
                      {w.name}
                      {w.cotenLinks && w.cotenLinks.length > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            color: COLORS.gold,
                            fontWeight: 600,
                          }}
                          title="COTENリンクあり"
                        >
                          🎙 COTEN
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: COLORS.textSub,
                      }}
                    >
                      {w.theater}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      style={{
                        fontSize: 10,
                        color: COLORS.text,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 84,
                        textAlign: 'right',
                      }}
                    >
                      {w.year}–{w.endYear}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: REGION_BADGE_COLOR[w.region],
                        color: '#fff',
                      }}
                    >
                      {REGIONS[w.region]}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        border: `1px solid ${COLORS.rust}`,
                        color: COLORS.rust,
                      }}
                    >
                      {TYPE_LABEL[w.type]}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: '8px 18px',
            borderTop: `1px solid ${COLORS.border}`,
            fontSize: 10,
            color: COLORS.textSub,
            display: 'flex',
            gap: 14,
          }}
        >
          <span>↑↓ 移動</span>
          <span>Enter 選択</span>
          <span>Esc 閉じる</span>
        </div>
      </div>
    </div>
  );
}
