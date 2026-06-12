'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { WANTA_COMMENTS } from '@/lib/wanta';
import { WantaComments } from '@/lib/types';

const COLORS = {
  bg: '#fffbeb',
  panel: '#fff',
  text: '#451a03',
  textSub: '#92400e',
  amber: '#f59e0b',
  amberDark: '#d97706',
  border: 'rgba(245,158,11,0.3)',
};

type TabKey = keyof WantaComments;

const TAB_META: { key: TabKey; label: string; emoji: string; color: string }[] = [
  { key: 'digest',       label: 'ダイジェスト', emoji: '📋', color: '#2563eb' },
  { key: 'detail',       label: '詳説',         emoji: '📖', color: '#d97706' },
  { key: 'perspectives', label: '各国の視点',   emoji: '🌍', color: '#059669' },
  { key: 'structure',    label: '構造分析',     emoji: '🔍', color: '#7c3aed' },
  { key: 'legacy',       label: '歴史的連鎖',   emoji: '🔗', color: '#dc2626' },
  { key: 'human',        label: '市民',         emoji: '🕊️', color: '#0891b2' },
  { key: 'lessons',      label: '教訓',         emoji: '💡', color: '#b91c1c' },
];

interface WantaEntry {
  warId: string;
  warName: string;
  year: number;
  endYear: number;
  tabKey: TabKey;
  tabLabel: string;
  tabEmoji: string;
  tabColor: string;
  comment: string;
}

type ViewMode = 'flat' | 'grouped';

export default function WantaListPage() {
  const [tabFilter, setTabFilter] = useState<TabKey | 'all'>('all');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('flat');

  // 全ワンタコメントをフラットなリストに展開（戦争の年代順）
  const allEntries = useMemo<WantaEntry[]>(() => {
    const entries: WantaEntry[] = [];
    const sortedWars = [...WARS].sort((a, b) => a.year - b.year);
    for (const war of sortedWars) {
      const comments = WANTA_COMMENTS[war.id];
      if (!comments) continue;
      for (const meta of TAB_META) {
        const c = comments[meta.key];
        if (!c) continue;
        entries.push({
          warId: war.id,
          warName: war.name,
          year: war.year,
          endYear: war.endYear,
          tabKey: meta.key,
          tabLabel: meta.label,
          tabEmoji: meta.emoji,
          tabColor: meta.color,
          comment: c,
        });
      }
    }
    return entries;
  }, []);

  // タブごとの件数
  const tabCounts = useMemo<Record<TabKey, number>>(() => {
    const counts = {} as Record<TabKey, number>;
    for (const meta of TAB_META) {
      counts[meta.key] = allEntries.filter(e => e.tabKey === meta.key).length;
    }
    return counts;
  }, [allEntries]);

  // ユニーク戦争数
  const uniqueWarCount = useMemo(() => {
    return new Set(allEntries.map(e => e.warId)).size;
  }, [allEntries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEntries.filter(e => {
      if (tabFilter !== 'all' && e.tabKey !== tabFilter) return false;
      if (q && !e.warName.toLowerCase().includes(q) && !e.comment.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allEntries, tabFilter, query]);

  // グループ化（戦争ごと）
  const groupedEntries = useMemo(() => {
    const map = new Map<string, { warId: string; warName: string; year: number; endYear: number; entries: WantaEntry[] }>();
    for (const e of filtered) {
      if (!map.has(e.warId)) {
        map.set(e.warId, { warId: e.warId, warName: e.warName, year: e.year, endYear: e.endYear, entries: [] });
      }
      map.get(e.warId)!.entries.push(e);
    }
    return Array.from(map.values());
  }, [filtered]);

  const formatYear = (y: number) => (y < 0 ? `BC${-y}` : `${y}`);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>

      {/* ヘッダー */}
      <header style={{
        background: '#0f172a', position: 'sticky', top: 0, zIndex: 50,
        padding: '10px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <Link href="/" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(148,163,184,0.2)' }}>
              ← ホーム
            </Link>
            <span className="font-serif" style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>War Chronicle</span>
            <span style={{ fontSize: 9, color: '#475569', letterSpacing: '0.12em' }}>わんたの解説一覧</span>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: '探索', href: '/explore', emoji: '🗺️' },
              { label: '教訓一覧', href: '/lessons', emoji: '💡' },
              { label: '全文検索', href: '/search', emoji: '🔍' },
            ].map(({ label, href, emoji }) => (
              <Link key={label} href={href} style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 4,
                color: '#94a3b8', textDecoration: 'none',
                border: '1px solid rgba(148,163,184,0.2)',
              }}>{emoji} {label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

        {/* タイトル */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '3px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wanta.png" alt="わんた" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = '🐕'; }} />
          </div>
          <div>
            <h1 className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
              わんたの解説 全集
            </h1>
            <p style={{ fontSize: 12, color: COLORS.textSub }}>
              全戦争・全タブのわんたコメントを一覧化。気になる解説からその戦争のページに飛べるんだワン🐾
            </p>
          </div>
        </div>

        {/* 統計サマリー行 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { emoji: '🐕', label: '解説総数', value: allEntries.length },
            { emoji: '⚔️', label: 'カバーする戦争', value: uniqueWarCount },
            { emoji: '📑', label: 'タブ種類', value: 7 },
          ].map(({ emoji, label, value }) => (
            <div key={label} style={{
              background: '#fff',
              border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 8,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: 9, color: '#92400e', whiteSpace: 'nowrap' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div style={{
          background: COLORS.panel, border: `1px solid ${COLORS.border}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          position: 'sticky', top: 54, zIndex: 40,
          boxShadow: '0 2px 8px rgba(245,158,11,0.1)',
        }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="戦争名・コメント内容で検索..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6, fontSize: 13,
              background: '#fffbeb', border: `1px solid ${COLORS.border}`,
              color: COLORS.text, outline: 'none', marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setTabFilter('all')}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: tabFilter === 'all' ? COLORS.amberDark : 'transparent',
                color: tabFilter === 'all' ? '#fff' : COLORS.textSub,
                border: `1px solid ${tabFilter === 'all' ? COLORS.amberDark : COLORS.border}`,
              }}>
              全タブ {allEntries.length}
            </button>
            {TAB_META.map(m => (
              <button key={m.key} onClick={() => setTabFilter(tabFilter === m.key ? 'all' : m.key)}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: tabFilter === m.key ? m.color : 'transparent',
                  color: tabFilter === m.key ? '#fff' : COLORS.textSub,
                  border: `1px solid ${tabFilter === m.key ? m.color : COLORS.border}`,
                  transition: 'all 0.15s',
                }}>
                {m.emoji} {m.label} {tabCounts[m.key]}
              </button>
            ))}
            <span style={{ fontSize: 10, color: COLORS.textSub, marginLeft: 'auto' }}>
              {filtered.length} 件 / 全 {allEntries.length} 件
            </span>
          </div>

          {/* 表示切替トグル */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              onClick={() => setViewMode('flat')}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: viewMode === 'flat' ? COLORS.amberDark : 'transparent',
                color: viewMode === 'flat' ? '#fff' : COLORS.textSub,
                border: `1px solid ${viewMode === 'flat' ? COLORS.amberDark : COLORS.border}`,
                transition: 'all 0.15s',
              }}>
              📜 フラット表示
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: viewMode === 'grouped' ? COLORS.amberDark : 'transparent',
                color: viewMode === 'grouped' ? '#fff' : COLORS.textSub,
                border: `1px solid ${viewMode === 'grouped' ? COLORS.amberDark : COLORS.border}`,
                transition: 'all 0.15s',
              }}>
              ⚔️ 戦争ごと表示
            </button>
          </div>
        </div>

        {/* コメント一覧 */}
        {viewMode === 'flat' ? (
          /* ── フラット表示 ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((e) => (
              <div key={`${e.warId}-${e.tabKey}`} style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}>
                {/* 吹き出し風コメント */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 戦争名＋タブバッジ */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <span className="font-serif" style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                      {e.warName}
                    </span>
                    <span style={{ fontSize: 9, color: COLORS.textSub, fontVariantNumeric: 'tabular-nums' }}>
                      {formatYear(e.year)}–{formatYear(e.endYear)}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: `${e.tabColor}15`, color: e.tabColor, border: `1px solid ${e.tabColor}40`,
                    }}>
                      {e.tabEmoji} {e.tabLabel}タブ
                    </span>
                  </div>
                  {/* コメント本文 */}
                  <p style={{ fontSize: 12, lineHeight: 1.75, color: COLORS.text }}>
                    {e.comment}
                  </p>
                </div>
                {/* ジャンプボタン */}
                <a href={`/explore?war=${e.warId}`} style={{
                  flexShrink: 0, alignSelf: 'center', marginLeft: 'auto',
                  fontSize: 10, fontWeight: 700, padding: '7px 12px', borderRadius: 6,
                  background: COLORS.amberDark, color: '#fff', textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>
                  📖 読む →
                </a>
              </div>
            ))}
          </div>
        ) : (
          /* ── グループ表示（戦争ごと） ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groupedEntries.map((group) => (
              <div key={group.warId} style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {/* グループヘッダー */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  borderBottom: `1px solid ${COLORS.border}`,
                  padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                }}>
                  <span className="font-serif" style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, flex: 1, minWidth: 0 }}>
                    ⚔️ {group.warName}
                  </span>
                  <span style={{ fontSize: 10, color: COLORS.textSub, whiteSpace: 'nowrap' }}>
                    {formatYear(group.year)}–{formatYear(group.endYear)}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                    background: `${COLORS.amberDark}20`, color: COLORS.amberDark,
                    border: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap',
                  }}>
                    {group.entries.length} 件
                  </span>
                  <a href={`/explore?war=${group.warId}`} style={{
                    fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6,
                    background: COLORS.amberDark, color: '#fff', textDecoration: 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    📖 読む →
                  </a>
                </div>
                {/* コメント行 */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {group.entries.map((e, idx) => (
                    <div key={`${e.warId}-${e.tabKey}`} style={{
                      padding: '10px 16px',
                      borderBottom: idx < group.entries.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <span style={{
                        flexShrink: 0,
                        fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                        background: `${e.tabColor}15`, color: e.tabColor, border: `1px solid ${e.tabColor}40`,
                        whiteSpace: 'nowrap', marginTop: 2,
                      }}>
                        {e.tabEmoji} {e.tabLabel}
                      </span>
                      <p style={{ fontSize: 12, lineHeight: 1.75, color: COLORS.text, margin: 0, flex: 1, minWidth: 0 }}>
                        {e.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: COLORS.textSub }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🐕</div>
            <div style={{ fontSize: 13 }}>該当する解説が見つからんかったワン</div>
          </div>
        )}
      </div>
    </div>
  );
}
