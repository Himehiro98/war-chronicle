'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { LESSONS } from '@/lib/lessons';
import { WarTag } from '@/lib/types';

const COLORS = {
  bg: '#0f172a',
  panel: '#1e293b',
  card: '#1a2540',
  rust: '#8b3a1e',
  teal: '#1a4a42',
  gold: '#b8860b',
  amber: '#d97706',
  text: '#f8fafc',
  textSub: '#94a3b8',
  border: 'rgba(248,250,252,0.08)',
  borderHover: 'rgba(248,250,252,0.15)',
};

const REPRO_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  '高': { color: '#fca5a5', bg: 'rgba(239,68,68,0.15)', label: '再現性：高' },
  '確実': { color: '#fca5a5', bg: 'rgba(239,68,68,0.2)', label: '再現性：確実' },
  '中': { color: '#fcd34d', bg: 'rgba(245,158,11,0.15)', label: '再現性：中' },
  '低': { color: '#86efac', bg: 'rgba(34,197,94,0.15)', label: '再現性：低' },
};

const ALL_TAGS: WarTag[] = [
  'ナショナリズム', '経済危機', '安全保障ジレンマ', '資源争奪', '帝国衰退',
  '宗教対立', '革命', '情報戦・プロパガンダ', '同盟暴走', '核抑止',
  '冷戦構造', '植民地解放', '民族浄化', '権力真空', '誤算・誤認知',
  '指導者個人要因', '王朝継承', '文明衝突', '軍事革命', '海洋覇権', '遊牧vs農耕',
];

function getReproLevel(text: string): string {
  if (!text) return '';
  if (text.includes('確実')) return '確実';
  if (text.includes('非常に高い') || text.includes('非常に高')) return '高';
  if (text.includes('高い') || text.includes('高：') || text.includes('高</strong>')) return '高';
  if (text.includes('中程度') || text.includes('中：')) return '中';
  if (text.includes('低い') || text.includes('低：')) return '低';
  if (text.startsWith('<strong>高')) return '高';
  if (text.startsWith('<strong>中')) return '中';
  if (text.startsWith('<strong>低')) return '低';
  return '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export default function LessonsPage() {
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<WarTag | 'all'>('all');
  const [reproFilter, setReproFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // WARS × LESSONS を結合
  const items = useMemo(() => {
    return WARS
      .filter(w => LESSONS[w.id])
      .map(w => {
        const l = LESSONS[w.id];
        const reproLevel = getReproLevel(l.reproducibility);
        return { war: w, lessons: l, reproLevel };
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ war, lessons, reproLevel }) => {
      // タグフィルター
      if (tagFilter !== 'all') {
        if (!war.tags?.includes(tagFilter)) return false;
      }
      // 再現性フィルター
      if (reproFilter !== 'all') {
        if (reproLevel !== reproFilter) return false;
      }
      // キーワードフィルター
      if (q) {
        const searchText = [
          war.name,
          war.theater,
          ...(war.tags ?? []),
          ...(war.ideologies ?? []),
          stripHtml(lessons.commonalities),
          stripHtml(lessons.universality),
          stripHtml(lessons.modernLessons),
          stripHtml(lessons.preventable),
          stripHtml(lessons.reproducibility),
        ].join(' ').toLowerCase();
        if (!searchText.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, tagFilter, reproFilter]);

  // 再現性：高/確実 を先頭に
  const sorted = useMemo(() => {
    const order: Record<string, number> = { '確実': 0, '高': 1, '中': 2, '低': 3, '': 4 };
    return [...filtered].sort((a, b) => (order[a.reproLevel] ?? 4) - (order[b.reproLevel] ?? 4));
  }, [filtered]);

  const reproCount = useMemo(() => {
    const c: Record<string, number> = { '確実': 0, '高': 0, '中': 0, '低': 0, '': 0 };
    items.forEach(({ reproLevel }) => { c[reproLevel] = (c[reproLevel] ?? 0) + 1; });
    return c;
  }, [items]);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>

      {/* ヘッダー */}
      <header style={{
        background: '#0f172a',
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 50,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Link href="/" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '4px 8px', borderRadius: 3, border: '1px solid rgba(148,163,184,0.2)' }}>
            ← ホーム
          </Link>
          <span className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
            War Chronicle
          </span>
          <span style={{ fontSize: 9, color: '#475569', letterSpacing: '0.12em' }}>教訓データベース</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/search" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(148,163,184,0.2)' }}>
            🔍 全文検索
          </Link>
          <Link href="/explore" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(148,163,184,0.2)' }}>
            🗺️ 探索
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* タイトル */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
            💡 戦争の教訓：全戦争横断データベース
          </h1>
          <p style={{ fontSize: 13, color: COLORS.textSub, lineHeight: 1.7, maxWidth: 700 }}>
            人類は似た条件で何度も衝突してきた。過去の戦争を科学的に分析し、パターンを発見し、現代における戦争防止のヒントを探す。
            <br />「再現性：高・確実」の戦争は、今この瞬間も同じ条件が世界のどこかで揃いつつある。
          </p>
        </div>

        {/* 統計カード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
          {[
            { label: '全教訓', count: items.length, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
            { label: '再現性：確実', count: reproCount['確実'] ?? 0, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
            { label: '再現性：高', count: reproCount['高'] ?? 0, color: '#fca5a5', bg: 'rgba(252,165,165,0.1)' },
            { label: '再現性：中', count: reproCount['中'] ?? 0, color: '#fcd34d', bg: 'rgba(252,211,77,0.1)' },
            { label: '再現性：低', count: reproCount['低'] ?? 0, color: '#86efac', bg: 'rgba(134,239,172,0.1)' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
              <div style={{ fontSize: 9, color: COLORS.textSub, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* フィルターエリア */}
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '16px 18px', marginBottom: 24 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="キーワードで検索（例：ナショナリズム、核、民族浄化、現代への教訓...）"
            style={{
              width: '100%', padding: '9px 14px', borderRadius: 6, fontSize: 13,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              color: COLORS.text, outline: 'none', marginBottom: 14, boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 9, color: COLORS.textSub, alignSelf: 'center', marginRight: 4, fontWeight: 700, letterSpacing: '0.1em' }}>再現性</span>
            {[
              { id: 'all', label: '全て' },
              { id: '確実', label: '確実 🔴' },
              { id: '高', label: '高 🟡' },
              { id: '中', label: '中 🟢' },
              { id: '低', label: '低 ⚪' },
            ].map(o => (
              <button key={o.id} onClick={() => setReproFilter(o.id)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: reproFilter === o.id ? COLORS.rust : 'transparent',
                  color: reproFilter === o.id ? '#fff' : COLORS.textSub,
                  border: `1px solid ${reproFilter === o.id ? COLORS.rust : COLORS.border}`,
                  transition: 'all 0.15s',
                }}>
                {o.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: COLORS.textSub, alignSelf: 'center', marginRight: 4, fontWeight: 700, letterSpacing: '0.1em' }}>タグ</span>
            <button onClick={() => setTagFilter('all')}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: tagFilter === 'all' ? COLORS.teal : 'transparent',
                color: tagFilter === 'all' ? '#fff' : COLORS.textSub,
                border: `1px solid ${tagFilter === 'all' ? COLORS.teal : COLORS.border}`,
              }}>
              全タグ
            </button>
            {ALL_TAGS.map(tag => (
              <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? 'all' : tag)}
                style={{
                  padding: '3px 9px', borderRadius: 20, fontSize: 9, cursor: 'pointer',
                  background: tagFilter === tag ? COLORS.teal : 'transparent',
                  color: tagFilter === tag ? '#fff' : COLORS.textSub,
                  border: `1px solid ${tagFilter === tag ? COLORS.teal : COLORS.border}`,
                  transition: 'all 0.15s',
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 結果数 */}
        <div style={{ fontSize: 11, color: COLORS.textSub, marginBottom: 16 }}>
          {sorted.length} 件 / {items.length} 件 表示中
        </div>

        {/* 教訓カード一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(({ war, lessons, reproLevel }) => {
            const badge = REPRO_BADGE[reproLevel];
            const isExpanded = expandedId === war.id;
            return (
              <div key={war.id}
                style={{
                  background: COLORS.panel,
                  border: `1px solid ${isExpanded ? COLORS.borderHover : COLORS.border}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}>
                {/* カードヘッダー（クリックで展開） */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : war.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px',
                    background: 'transparent', cursor: 'pointer', border: 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span className="font-serif" style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                        {war.name}
                      </span>
                      <span style={{ fontSize: 10, color: COLORS.textSub, fontVariantNumeric: 'tabular-nums' }}>
                        {war.year}–{war.endYear}
                      </span>
                      {badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40`,
                        }}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(war.tags ?? []).slice(0, 5).map(tag => (
                        <span key={tag} style={{
                          fontSize: 9, padding: '1px 6px', borderRadius: 3,
                          background: 'rgba(148,163,184,0.08)', color: COLORS.textSub,
                          border: '1px solid rgba(148,163,184,0.15)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{
                      fontSize: 9, color: COLORS.textSub, maxWidth: 200, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'none',
                    }}>
                      {stripHtml(lessons.modernLessons).slice(0, 60)}
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.textSub, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▼
                    </span>
                  </div>
                </button>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '16px', background: COLORS.card }}>
                    {[
                      { key: 'commonalities' as const, label: '🔗 他の戦争との共通点', color: '#2563eb' },
                      { key: 'universality' as const, label: '🌍 普遍的メカニズム', color: '#7c3aed' },
                      { key: 'modernLessons' as const, label: '💡 現代への教訓', color: '#d97706' },
                      { key: 'preventable' as const, label: '🛡️ 防止可能性', color: '#059669' },
                      { key: 'reproducibility' as const, label: '⚠️ 再現性・再発リスク', color: '#dc2626' },
                    ].map(({ key, label, color }) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.08em', marginBottom: 4 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 11, lineHeight: 1.7, color: '#cbd5e1' }}
                          dangerouslySetInnerHTML={{ __html: lessons[key] }} />
                      </div>
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8 }}>
                      <Link href={`/explore?war=${war.id}`}
                        style={{
                          fontSize: 10, padding: '5px 12px', borderRadius: 4,
                          background: COLORS.rust, color: '#fff', textDecoration: 'none', fontWeight: 600,
                        }}>
                        📖 詳細を読む
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textSub }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 13 }}>該当する教訓が見つからんかった</div>
          </div>
        )}
      </div>
    </div>
  );
}
