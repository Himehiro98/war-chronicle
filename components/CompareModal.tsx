'use client';

import { useEffect, useMemo, useState } from 'react';
import { WARS, REGIONS } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';
import { War } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_SLOTS = 3;
const MIN_SLOTS = 2;

const SLOT_ACCENTS = [
  { border: '#1a4a42', bg: 'rgba(26, 74, 66, 0.06)', label: '#1a4a42' },   // teal
  { border: '#8b3a1e', bg: 'rgba(139, 58, 30, 0.06)', label: '#8b3a1e' },  // rust
  { border: '#6b4a8b', bg: 'rgba(107, 74, 139, 0.06)', label: '#6b4a8b' }, // purple
];

const TYPE_LABEL: Record<string, string> = {
  war: '戦争',
  revolution: '革命',
  colonial: '植民地戦争',
};

function truncate(s: string | undefined, n = 150): string {
  if (!s) return '—';
  if (s.length <= n) return s;
  return s.slice(0, n) + '…';
}

export default function CompareModal({ isOpen, onClose }: Props) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null]);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // ESC key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickerIdx !== null) {
          setPickerIdx(null);
          setSearch('');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, pickerIdx]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPickerIdx(null);
      setSearch('');
    }
  }, [isOpen]);

  const sortedWars = useMemo(() => [...WARS].sort((a, b) => a.year - b.year), []);

  const filteredWars = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedWars;
    return sortedWars.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.theater.toLowerCase().includes(q) ||
        String(w.year).includes(q)
    );
  }, [search, sortedWars]);

  const selectedWars: (War | null)[] = slots.map((id) =>
    id ? WARS.find((w) => w.id === id) ?? null : null
  );

  const filledCount = selectedWars.filter(Boolean).length;

  if (!isOpen) return null;

  const setSlot = (idx: number, warId: string | null) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = warId;
      return next;
    });
  };

  const addSlot = () => {
    if (slots.length < MAX_SLOTS) setSlots((prev) => [...prev, null]);
  };

  const removeSlot = (idx: number) => {
    if (slots.length <= MIN_SLOTS) {
      // just clear the slot
      setSlot(idx, null);
      return;
    }
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const rows: { label: string; render: (w: War) => React.ReactNode }[] = [
    {
      label: '期間',
      render: (w) => `${w.year}〜${w.endYear}`,
    },
    {
      label: '地域',
      render: (w) => REGIONS[w.region],
    },
    {
      label: '種別',
      render: (w) => TYPE_LABEL[w.type] ?? w.type,
    },
    {
      label: '主戦場',
      render: (w) => w.theater,
    },
    {
      label: '背景',
      render: (w) => truncate(WAR_CONTENT[w.id]?.digest.background),
    },
    {
      label: '主要関係者',
      render: (w) => truncate(WAR_CONTENT[w.id]?.digest.actors),
    },
    {
      label: '構造的要因',
      render: (w) => truncate(WAR_CONTENT[w.id]?.digest.structural),
    },
    {
      label: '帰結',
      render: (w) => truncate(WAR_CONTENT[w.id]?.digest.aftermath),
    },
    {
      label: '視点数',
      render: (w) => `${WAR_CONTENT[w.id]?.perspectives.length ?? 0} 件`,
    },
    {
      label: '因子数',
      render: (w) => `${WAR_CONTENT[w.id]?.structure.factors.length ?? 0} 件`,
    },
    {
      label: '連鎖数',
      render: (w) => `${WAR_CONTENT[w.id]?.legacy.length ?? 0} 件`,
    },
    {
      label: 'COTEN連携',
      render: (w) => (w.cotenLinks && w.cotenLinks.length > 0 ? '🎙' : '—'),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(20, 16, 12, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-lg shadow-2xl"
        style={{
          width: '90vw',
          height: '85vh',
          backgroundColor: '#f5f0e8',
          border: '1px solid rgba(139, 58, 30, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(26, 74, 66, 0.18)' }}
        >
          <div>
            <h2
              className="text-xl font-bold tracking-wide"
              style={{ color: '#1a4a42' }}
            >
              戦争比較
            </h2>
            <p className="text-xs mt-1" style={{ color: '#6b5a4a' }}>
              2〜3 件の戦争を並べて読み比べる
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none px-2 hover:opacity-70 transition-opacity"
            style={{ color: '#8b3a1e' }}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* Slot pickers */}
        <div
          className="px-6 py-4 border-b flex items-start gap-3 flex-wrap"
          style={{ borderColor: 'rgba(26, 74, 66, 0.12)' }}
        >
          {slots.map((id, idx) => {
            const war = selectedWars[idx];
            const accent = SLOT_ACCENTS[idx % SLOT_ACCENTS.length];
            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded px-3 py-2 min-w-[200px]"
                style={{
                  backgroundColor: accent.bg,
                  borderLeft: `3px solid ${accent.border}`,
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: accent.label }}
                >
                  #{idx + 1}
                </span>
                {war ? (
                  <>
                    <span
                      className="text-sm font-semibold flex-1"
                      style={{ color: '#2a1f15' }}
                    >
                      {war.name}
                      <span className="ml-2 text-xs opacity-60">
                        ({war.year})
                      </span>
                    </span>
                    <button
                      onClick={() => setSlot(idx, null)}
                      className="text-lg leading-none px-1 hover:opacity-60"
                      style={{ color: '#8b3a1e' }}
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setPickerIdx(idx);
                      setSearch('');
                    }}
                    className="text-sm flex-1 text-left hover:opacity-70"
                    style={{ color: accent.label }}
                  >
                    + 戦争を選択
                  </button>
                )}
                {slots.length > MIN_SLOTS && (
                  <button
                    onClick={() => removeSlot(idx)}
                    className="text-xs ml-1 opacity-50 hover:opacity-90"
                    style={{ color: '#6b5a4a' }}
                    title="このスロットを削除"
                  >
                    ⊖
                  </button>
                )}
              </div>
            );
          })}
          {slots.length < MAX_SLOTS && (
            <button
              onClick={addSlot}
              className="px-3 py-2 text-xs rounded border-dashed border hover:opacity-70"
              style={{
                borderColor: 'rgba(26, 74, 66, 0.4)',
                color: '#1a4a42',
              }}
            >
              + スロット追加
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {filledCount < MIN_SLOTS ? (
            <div
              className="h-full flex items-center justify-center text-center"
              style={{ color: '#6b5a4a' }}
            >
              <div>
                <div className="text-4xl mb-3 opacity-40">⚖</div>
                <p className="text-base font-medium">
                  2つ以上の戦争を選択してください
                </p>
                <p className="text-xs mt-2 opacity-70">
                  上の「+ 戦争を選択」を押してくれ
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th
                    className="text-left px-3 py-2 font-semibold sticky top-0"
                    style={{
                      backgroundColor: '#f5f0e8',
                      color: '#6b5a4a',
                      width: '140px',
                      borderBottom: '2px solid rgba(26, 74, 66, 0.25)',
                    }}
                  >
                    比較項目
                  </th>
                  {selectedWars.map((w, idx) => {
                    if (!w) return null;
                    const accent = SLOT_ACCENTS[idx % SLOT_ACCENTS.length];
                    return (
                      <th
                        key={idx}
                        className="text-left px-3 py-2 font-semibold sticky top-0"
                        style={{
                          backgroundColor: '#f5f0e8',
                          color: accent.label,
                          borderBottom: `2px solid ${accent.border}`,
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="text-base">{w.name}</span>
                          <span
                            className="text-[11px] font-normal opacity-70"
                            style={{ color: '#6b5a4a' }}
                          >
                            {w.year}〜{w.endYear}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  // Highlight when values differ
                  const values = selectedWars
                    .map((w) => (w ? String(row.render(w)) : null))
                    .filter((v): v is string => v !== null);
                  const allSame =
                    values.length > 0 && values.every((v) => v === values[0]);
                  const highlight = !allSame && values.length >= 2;

                  return (
                    <tr
                      key={row.label}
                      style={{
                        backgroundColor:
                          ri % 2 === 0 ? 'transparent' : 'rgba(26, 74, 66, 0.04)',
                      }}
                    >
                      <td
                        className="px-3 py-3 font-semibold align-top"
                        style={{
                          color: '#1a4a42',
                          borderBottom: '1px solid rgba(26, 74, 66, 0.08)',
                          fontSize: '12px',
                        }}
                      >
                        {row.label}
                        {highlight && (
                          <span
                            className="ml-1 text-[9px]"
                            style={{ color: '#b8860b' }}
                            title="値が異なる"
                          >
                            ◆
                          </span>
                        )}
                      </td>
                      {selectedWars.map((w, ci) => {
                        if (!w) return null;
                        const accent = SLOT_ACCENTS[ci % SLOT_ACCENTS.length];
                        return (
                          <td
                            key={ci}
                            className="px-3 py-3 align-top leading-relaxed"
                            style={{
                              color: '#2a1f15',
                              borderBottom: '1px solid rgba(26, 74, 66, 0.08)',
                              borderLeft: `2px solid ${accent.border}22`,
                              fontSize: '13px',
                            }}
                          >
                            {row.render(w)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* War picker overlay */}
        {pickerIdx !== null && (
          <div
            className="absolute inset-0 z-10 flex items-start justify-center pt-24"
            style={{ backgroundColor: 'rgba(20, 16, 12, 0.4)' }}
            onClick={() => {
              setPickerIdx(null);
              setSearch('');
            }}
          >
            <div
              className="rounded-lg shadow-xl flex flex-col"
              style={{
                width: '420px',
                maxHeight: '60vh',
                backgroundColor: '#f5f0e8',
                border: '1px solid rgba(139, 58, 30, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'rgba(26, 74, 66, 0.15)' }}
              >
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="戦争名・年・地域で検索…"
                  className="w-full px-3 py-2 text-sm rounded outline-none"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(26, 74, 66, 0.25)',
                    color: '#2a1f15',
                  }}
                />
              </div>
              <div className="flex-1 overflow-auto">
                {filteredWars.length === 0 ? (
                  <div
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: '#6b5a4a' }}
                  >
                    該当なし
                  </div>
                ) : (
                  <ul>
                    {filteredWars.map((w) => {
                      const alreadyPicked = slots.includes(w.id);
                      return (
                        <li key={w.id}>
                          <button
                            disabled={alreadyPicked}
                            onClick={() => {
                              setSlot(pickerIdx, w.id);
                              setPickerIdx(null);
                              setSearch('');
                            }}
                            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-black/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ color: '#2a1f15' }}
                          >
                            <span
                              className="text-xs font-mono"
                              style={{ color: '#8b3a1e', minWidth: '52px' }}
                            >
                              {w.year}
                            </span>
                            <span className="text-sm flex-1">{w.name}</span>
                            <span
                              className="text-[10px]"
                              style={{ color: '#6b5a4a' }}
                            >
                              {REGIONS[w.region]}
                            </span>
                            {alreadyPicked && (
                              <span
                                className="text-[10px] ml-1"
                                style={{ color: '#1a4a42' }}
                              >
                                選択済
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div
                className="px-4 py-2 text-[10px] border-t flex justify-between"
                style={{
                  borderColor: 'rgba(26, 74, 66, 0.15)',
                  color: '#6b5a4a',
                }}
              >
                <span>{filteredWars.length} 件</span>
                <span>Esc で閉じる</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
