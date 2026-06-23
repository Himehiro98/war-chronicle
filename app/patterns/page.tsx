'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { TAGS } from '@/lib/tags';
import { WarTag } from '@/lib/types';

const formatYear = (y: number) => (y < 0 ? `BC${-y}` : `${y}`);

/** 6つの時代区分（通史モードと統一） */
const ERA_BANDS = [
  { id: 'ancient',     label: '古代',   max: 500,   color: '#b45309' },
  { id: 'medieval',    label: '中世',   max: 1450,  color: '#0f766e' },
  { id: 'renaissance', label: '近世',   max: 1700,  color: '#6d28d9' },
  { id: 'early',       label: '近代',   max: 1900,  color: '#4338ca' },
  { id: '20c',         label: '20世紀', max: 2000,  color: '#b91c1c' },
  { id: 'now',         label: '現代',   max: 9999,  color: '#1d4ed8' },
] as const;

function eraOf(year: number) {
  for (const b of ERA_BANDS) if (year < b.max) return b;
  return ERA_BANDS[ERA_BANDS.length - 1];
}

interface TaggedWar {
  id: string;
  name: string;
  year: number;
  endYear: number;
}

export default function PatternsEvolutionPage() {
  // タグごとの戦争リスト（年代順）と出現数
  const tagWars = useMemo<Record<string, TaggedWar[]>>(() => {
    const m: Record<string, TaggedWar[]> = {};
    for (const w of WARS) {
      for (const t of w.tags ?? []) {
        (m[t] = m[t] || []).push({ id: w.id, name: w.name, year: w.year, endYear: w.endYear });
      }
    }
    for (const t of Object.keys(m)) m[t].sort((a, b) => a.year - b.year);
    return m;
  }, []);

  // 出現数の多い順にタグを並べる
  const orderedTags = useMemo<WarTag[]>(() => {
    return (Object.keys(tagWars) as WarTag[]).sort((a, b) => tagWars[b].length - tagWars[a].length);
  }, [tagWars]);

  const [selected, setSelected] = useState<WarTag>('ナショナリズム');

  // ?tag= で初期選択
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('tag');
    if (q && tagWars[q]) setSelected(q as WarTag);
  }, [tagWars]);

  const wars = tagWars[selected] ?? [];
  const meta = TAGS[selected];

  // 時代別ヒストグラム
  const histogram = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of ERA_BANDS) counts[b.id] = 0;
    for (const w of wars) counts[eraOf(w.year).id]++;
    const max = Math.max(1, ...Object.values(counts));
    return ERA_BANDS.map((b) => ({ ...b, count: counts[b.id], pct: counts[b.id] / max }));
  }, [wars]);

  const firstWar = wars[0];
  const lastWar = wars[wars.length - 1];
  const spanYears = firstWar && lastWar ? lastWar.year - firstWar.year : 0;
  const eraCount = new Set(wars.map((w) => eraOf(w.year).id)).size;

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>

      {/* ヘッダー */}
      <header style={{
        background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(248,250,252,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <Link href="/" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(148,163,184,0.2)' }}>← ホーム</Link>
            <span className="font-serif" style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>War Chronicle</span>
            <span style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.12em' }}>パターン進化史</span>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: '通史', href: '/chronicle', emoji: '📖' },
              { label: '因果の大河', href: '/chains', emoji: '🌊' },
              { label: '探索', href: '/explore', emoji: '🗺️' },
            ].map(({ label, href, emoji }) => (
              <Link key={label} href={href} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, color: '#94a3b8', textDecoration: 'none', border: '1px solid rgba(148,163,184,0.2)' }}>{emoji} {label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* タイトル */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
            Pattern Evolution
          </div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, lineHeight: 1.3, marginBottom: 14 }}>
            同じ過ちの履歴書
          </h1>
          <p style={{ fontSize: 13.5, lineHeight: 1.95, color: '#cbd5e1', maxWidth: 680 }}>
            「人類は似た条件で何度も衝突してきた」——これは標語ではなく、データで見えるばい。
            戦争を動かす<strong style={{ color: '#fbbf24' }}>構造の論理</strong>を選ぶと、それが古代から現代まで
            <strong style={{ color: '#fbbf24' }}>何度も姿を現してきた履歴</strong>が時間軸に並ぶ。同じメカニズムの再来を、自分の目で確かめてほしい。
          </p>
        </div>

        {/* タグ選択 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 28 }}>
          {orderedTags.map((t) => {
            const active = t === selected;
            const m = TAGS[t];
            return (
              <button key={t} onClick={() => setSelected(t)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 13px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  fontWeight: active ? 700 : 500,
                  background: active ? (m?.accent ?? '#fbbf24') : 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  border: `1px solid ${active ? (m?.accent ?? '#fbbf24') : 'rgba(148,163,184,0.25)'}`,
                  transition: 'all 0.15s',
                }}>
                <span>{m?.emoji}</span>{t}
                <span style={{ fontSize: 9, opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>{tagWars[t].length}</span>
              </button>
            );
          })}
        </div>

        {/* 選択タグのパネル */}
        {meta && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            border: `1px solid ${meta.accent}44`, borderLeft: `4px solid ${meta.accent}`,
            padding: '22px 22px 26px', marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>{meta.emoji}</span>
              <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>{selected}</h2>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#e2e8f0', marginBottom: 14 }}>{meta.shortDesc}</p>

            {/* 統計 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              {[
                { label: '出現回数', value: `${wars.length}回` },
                { label: '最古の出現', value: firstWar ? formatYear(firstWar.year) : '—' },
                { label: '最新の出現', value: lastWar ? formatYear(lastWar.year) : '—' },
                { label: '貫く年月', value: `${spanYears.toLocaleString()}年` },
                { label: '跨ぐ時代', value: `${eraCount}/6` },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 14px', minWidth: 80 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: meta.accent, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 時代別ヒストグラム（進化の弧） */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', marginBottom: 8 }}>
                時代ごとの出現密度（このパターンがいつ激しかったか）
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
                {histogram.map((h) => (
                  <div key={h.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: h.count ? h.color : '#475569', fontVariantNumeric: 'tabular-nums' }}>{h.count}</div>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: `${Math.max(h.pct * 56, h.count ? 6 : 2)}px`,
                      background: h.count ? h.color : 'rgba(148,163,184,0.15)',
                      transition: 'height 0.4s',
                    }} />
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{h.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* メカニズム・古典/現代 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: meta.accent, letterSpacing: '0.08em', marginBottom: 4 }}>⚙️ 作動メカニズム</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.7, color: '#cbd5e1' }}>{meta.mechanism}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: meta.accent, letterSpacing: '0.08em', marginBottom: 4 }}>📜 古典的事例</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.7, color: '#cbd5e1' }}>{meta.classicCase}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(220,38,38,0.08)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', marginBottom: 4 }}>⚠️ 現代の警戒対象</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.7, color: '#fecaca' }}>{meta.modernRisk}</div>
              </div>
            </div>
          </div>
        )}

        {/* 全戦争タイムライン */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 14 }}>
          🧬 「{selected}」が現れた全{wars.length}戦争 ── 時代を超えた再来の記録
        </div>
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          {/* 縦の時間軸ライン */}
          <div style={{ position: 'absolute', left: 70, top: 6, bottom: 6, width: 2, background: 'rgba(148,163,184,0.18)' }} />

          {wars.map((w, i) => {
            const band = eraOf(w.year);
            const prevBand = i > 0 ? eraOf(wars[i - 1].year) : null;
            const isNewEra = !prevBand || prevBand.id !== band.id;
            return (
              <div key={w.id}>
                {/* 時代の境目に見出し */}
                {isNewEra && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: i === 0 ? '0 0 10px' : '22px 0 10px' }}>
                    <div style={{
                      marginLeft: 38, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      color: band.color, padding: '3px 10px', borderRadius: 12,
                      background: `${band.color}1f`, border: `1px solid ${band.color}55`,
                    }}>
                      {band.label}
                    </div>
                    <div style={{ flex: 1, height: 1, background: `${band.color}33` }} />
                  </div>
                )}
                {/* 戦争行 */}
                <Link href={`/explore?war=${w.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none',
                    padding: '5px 0', position: 'relative',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget.querySelector('[data-name]') as HTMLElement).style.color = band.color; }}
                  onMouseLeave={(e) => { (e.currentTarget.querySelector('[data-name]') as HTMLElement).style.color = '#e2e8f0'; }}>
                  {/* 年 */}
                  <span style={{ width: 62, textAlign: 'right', fontSize: 11, color: '#94a3b8', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {formatYear(w.year)}
                  </span>
                  {/* ドット */}
                  <span style={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: band.color, border: '2px solid #0f172a', boxShadow: `0 0 0 1px ${band.color}` }} />
                  </span>
                  {/* 戦争名 */}
                  <span data-name style={{ fontSize: 13, color: '#e2e8f0', transition: 'color 0.15s', fontWeight: 500 }}>
                    {w.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* 末尾の気づき */}
        <div style={{ marginTop: 40, padding: '20px 22px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🐾</span>
            <div>
              <p style={{ fontSize: 13, lineHeight: 1.85, color: '#e2e8f0', margin: 0 }}>
                「{selected}」は<strong style={{ color: '#fbbf24' }}>{formatYear(firstWar?.year ?? 0)}から{formatYear(lastWar?.year ?? 0)}まで、{spanYears.toLocaleString()}年かけて{wars.length}回</strong>くりかえし現れたワン。
                これは偶然やない——同じ条件が揃うと、人間は時代や文化を超えて同じ過ちを繰り返すんだばい。
                だけん「次にこの兆候を見たら危ない」と読む目が、戦争を防ぐ第一歩になるばい。
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <Link href="/diagnose" style={{ fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 6, background: '#fbbf24', color: '#0f172a', textDecoration: 'none' }}>
                  🔮 今の世界をAI診断
                </Link>
                <Link href="/lessons" style={{ fontSize: 11, fontWeight: 600, padding: '7px 14px', borderRadius: 6, background: 'transparent', color: '#f8fafc', border: '1px solid rgba(248,250,252,0.25)', textDecoration: 'none' }}>
                  💡 教訓を横断する
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
