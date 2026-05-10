'use client';

import { useState } from 'react';
import { TAGS, TAG_LIST } from '@/lib/tags';
import { WarTag } from '@/lib/types';
import { WARS } from '@/lib/wars';

export default function TagCloud() {
  const [selected, setSelected] = useState<WarTag | null>(null);

  // タグごとの戦争数（サイズ表示用）
  const counts: Record<string, number> = {};
  WARS.forEach((w) => {
    w.tags?.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    });
  });

  const matched = selected ? WARS.filter((w) => w.tags?.includes(selected)) : [];

  return (
    <div>
      {/* タグクラウド */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {TAG_LIST.map((tag) => {
          const t = TAGS[tag];
          const count = counts[tag] ?? 0;
          const isActive = selected === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelected(isActive ? null : tag)}
              style={{
                padding: '8px 14px', borderRadius: 6,
                background: isActive ? t.accent : 'white',
                color: isActive ? 'white' : '#1e293b',
                border: `1px solid ${isActive ? t.accent : 'rgba(15,23,42,0.12)'}`,
                fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(15,23,42,0.12)'; }}
            >
              <span>{t.emoji}</span>
              <span>{tag}</span>
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 8,
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.08)',
                color: isActive ? 'white' : '#475569',
                fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 選択時：タグ詳細 + 該当戦争 */}
      {selected && (
        <div style={{
          background: 'white',
          border: `2px solid ${TAGS[selected].accent}`,
          borderRadius: 10,
          padding: 20,
        }}>
          {/* タグ解説 */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{TAGS[selected].emoji}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: 'serif' }}>
                {selected}
              </h3>
            </div>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
              {TAGS[selected].shortDesc}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { label: 'メカニズム', body: TAGS[selected].mechanism, color: '#334155' },
                { label: '古典的事例', body: TAGS[selected].classicCase, color: '#334155' },
                { label: '現代の警戒対象', body: TAGS[selected].modernRisk, color: TAGS[selected].accent },
              ].map((b) => (
                <div key={b.label} style={{
                  background: '#f8fafc', padding: 12, borderRadius: 6,
                  borderLeft: `3px solid ${b.color}`,
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, color: '#64748b',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
                  }}>{b.label}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.65, color: '#1e293b' }}>{b.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 該当戦争一覧 */}
          {matched.length > 0 && (
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#64748b',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
              }}>
                このパターンを示す戦争（{matched.length}件）
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {matched.map((w) => (
                  <a key={w.id} href={`/explore?war=${w.id}`} style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 4,
                    background: '#f1f5f9', color: '#1e293b',
                    border: '1px solid rgba(15,23,42,0.08)',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = TAGS[selected].accent + '15'; e.currentTarget.style.borderColor = TAGS[selected].accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)'; }}
                  >
                    {w.name}（{w.year}）
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
          ↑ タグをクリックすると、構造解説と該当戦争一覧が表示されるばい
        </p>
      )}
    </div>
  );
}
