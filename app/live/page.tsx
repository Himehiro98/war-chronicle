'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LIVE_CONFLICTS, LIVE_DATA_UPDATED, LIVE_DATA_SOURCES, LiveConflictStats } from '@/lib/live-conflicts';

const COLORS = {
  bg: '#0f172a',
  panel: '#1e293b',
  card: '#1a2540',
  text: '#f8fafc',
  textSub: '#94a3b8',
  border: 'rgba(248,250,252,0.08)',
  borderHover: 'rgba(248,250,252,0.16)',
  rust: '#8b3a1e',
};

const STATUS_BADGE = {
  active:    { label: '🔴 交戦中',     color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  ceasefire: { label: '🟡 停戦・移行期', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  frozen:    { label: '⚪ 凍結紛争',    color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
};

function ConflictCard({ c }: { c: LiveConflictStats }) {
  const [expanded, setExpanded] = useState(false);
  const badge = STATUS_BADGE[c.status];

  const startYear = new Date(c.startDate).getFullYear();
  const now = new Date();
  const startMs = new Date(c.startDate).getTime();
  const yearsElapsed = ((now.getTime() - startMs) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);

  return (
    <div style={{
      background: COLORS.panel,
      border: `1px solid ${expanded ? c.accentColor + '60' : COLORS.border}`,
      borderLeft: `4px solid ${c.accentColor}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* ヘッダー行 */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', textAlign: 'left', padding: '14px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            <span className="font-serif" style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>
              {c.name}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40`,
            }}>
              {badge.label}
            </span>
            <span style={{ fontSize: 9, color: COLORS.textSub }}>
              {startYear}年〜（{yearsElapsed}年継続中）
            </span>
          </div>
          <div style={{ fontSize: 10, color: COLORS.textSub }}>{c.phase}</div>
        </div>
        {/* サマリーバッジ */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: COLORS.textSub, whiteSpace: 'nowrap' }}>{c.region}</span>
          <span style={{ fontSize: 12, color: COLORS.textSub, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </div>
      </button>

      {/* 統計サマリー行（常時表示） */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${COLORS.border}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8,
      }}>
        {[
          { icon: '💀', label: '死者（推計）', value: c.deathsTotal.split('（')[0] },
          { icon: '🏠', label: '国内避難民', value: c.idps },
          { icon: '🚶', label: '難民', value: c.refugees },
          { icon: '🍞', label: '食料不安', value: c.hungerAffected },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ padding: '6px 8px', background: COLORS.card, borderRadius: 5 }}>
            <div style={{ fontSize: 9, color: COLORS.textSub, marginBottom: 2 }}>{icon} {label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 展開コンテンツ */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '16px', background: COLORS.card }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
            {[
              { label: '死者詳細', value: c.deathsTotal, src: c.deathsSource + '（' + c.deathsAsOf + '）', icon: '💀' },
              { label: '避難民', value: `国内：${c.idps} ／ 国外：${c.refugees}`, src: c.displacedSource, icon: '🚶' },
              { label: '食料・人道', value: `食料不安：${c.hungerAffected} ／ 支援必要：${c.needHumanitarian}`, src: c.humanitarianSource, icon: '🍞' },
            ].map(({ label, value, src, icon }) => (
              <div key={label} style={{ padding: '10px 12px', background: COLORS.panel, borderRadius: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.textSub, letterSpacing: '0.08em', marginBottom: 4 }}>
                  {icon} {label}
                </div>
                <div style={{ fontSize: 11, color: COLORS.text, lineHeight: 1.5, marginBottom: 3 }}>{value}</div>
                <div style={{ fontSize: 9, color: COLORS.textSub }}>出典：{src}</div>
              </div>
            ))}
          </div>

          {/* 最新動向 */}
          <div style={{ padding: '10px 12px', background: `${c.accentColor}15`, borderLeft: `3px solid ${c.accentColor}`, borderRadius: '0 6px 6px 0', marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: c.accentColor, marginBottom: 4, letterSpacing: '0.08em' }}>
              📰 最新動向（{c.latestDate}）
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>{c.latestDevelopment}</div>
          </div>

          {/* ソースリンク + 詳細ページ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Link href={`/explore?war=${c.id}`} style={{
              fontSize: 10, padding: '5px 12px', borderRadius: 4,
              background: COLORS.rust, color: '#fff', textDecoration: 'none', fontWeight: 600,
            }}>
              📖 War Chronicle で詳しく読む
            </Link>
            {c.sources.map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 9, padding: '4px 10px', borderRadius: 4,
                background: 'transparent', color: COLORS.textSub,
                border: `1px solid ${COLORS.border}`, textDecoration: 'none',
              }}>
                🔗 {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  const activeCount = LIVE_CONFLICTS.filter(c => c.status === 'active').length;

  // 全統計合計（概算）
  const totalDisplaced = '約2,500万人';
  const totalHunger = '約7,000万人';

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>

      {/* ヘッダー */}
      <header style={{
        background: '#0f172a', borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 50,
        padding: '10px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <Link href="/" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(148,163,184,0.2)' }}>
              ← ホーム
            </Link>
            <span className="font-serif" style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>War Chronicle</span>
            <span style={{ fontSize: 9, color: '#475569', letterSpacing: '0.12em' }}>現在進行形の戦争</span>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: '教訓一覧', href: '/lessons', emoji: '💡' },
              { label: '全文検索', href: '/search', emoji: '🔍' },
              { label: 'AI診断', href: '/diagnose', emoji: '🔮' },
              { label: '探索', href: '/explore', emoji: '🗺️' },
            ].map(({ label, href, emoji }) => (
              <Link key={label} href={href} style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 4,
                color: '#94a3b8', textDecoration: 'none',
                border: '1px solid rgba(148,163,184,0.2)',
                transition: 'all 0.15s',
              }}>{emoji} {label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* タイトル */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>
              🔴 現在進行中の戦争
            </h1>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
            }}>
              {activeCount} 件 交戦中
            </span>
          </div>
          <p style={{ fontSize: 12, color: COLORS.textSub, lineHeight: 1.7, maxWidth: 700 }}>
            戦争は歴史の教科書の中だけにない。今この瞬間も、世界各地で何百万人もの人々が戦争の中を生きている。
            <br />数字は定期的に更新されます。最終更新：<strong style={{ color: COLORS.text }}>{LIVE_DATA_UPDATED}</strong>
          </p>
        </div>

        {/* グローバル統計 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10, marginBottom: 28,
        }}>
          {[
            { icon: '⚔️', label: '現在の主要紛争', value: `${LIVE_CONFLICTS.length}件`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { icon: '🔴', label: 'うち交戦中', value: `${activeCount}件`, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
            { icon: '🚶', label: '世界の難民・避難民（概算）', value: totalDisplaced, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: '🍞', label: '紛争関連の食料不安（概算）', value: totalHunger, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          ].map(({ icon, label, value, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 9, color: COLORS.textSub }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 注意書き */}
        <div style={{
          marginBottom: 24, padding: '10px 14px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 6, fontSize: 10, color: '#fcd34d', lineHeight: 1.6,
        }}>
          ⚠️ <strong>データについて：</strong>
          戦闘中の正確な死者数・避難民数は確認が困難なため、数値には幅があります。
          各数字の出典・基準日を確認してください。最新情報は各ソースリンクから確認できます。
          死者数は直接的戦闘死に加え、飢餓・疾病・インフラ崩壊による間接死を含む場合があります。
        </div>

        {/* 紛争カード一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {LIVE_CONFLICTS.map(c => (
            <ConflictCard key={c.id} c={c} />
          ))}
        </div>

        {/* データソース */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSub, marginBottom: 12, letterSpacing: '0.08em' }}>
            📊 主要データソース
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LIVE_DATA_SOURCES.map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', flexDirection: 'column', gap: 2,
                padding: '8px 12px', borderRadius: 6, textDecoration: 'none',
                background: COLORS.panel, border: `1px solid ${COLORS.border}`,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.text }}>{s.name}</span>
                <span style={{ fontSize: 9, color: COLORS.textSub }}>{s.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
