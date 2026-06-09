'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { LESSONS } from '@/lib/lessons';
import { WAR_CONTENT } from '@/lib/content';
import { WarTag } from '@/lib/types';

const COLORS = {
  bg: '#0f172a',
  panel: '#1e293b',
  card: '#1a2540',
  rust: '#8b3a1e',
  teal: '#1a4a42',
  gold: '#b8860b',
  text: '#f8fafc',
  textSub: '#94a3b8',
  border: 'rgba(248,250,252,0.08)',
  borderHover: 'rgba(248,250,252,0.18)',
  highlight: '#d97706',
};

type MatchField = {
  label: string;
  snippet: string;
  emoji: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

function getSnippet(text: string, query: string, maxLen = 120): string {
  const plain = stripHtml(text);
  const lowerText = plain.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQ);
  if (idx === -1) return plain.slice(0, maxLen) + (plain.length > maxLen ? '…' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(plain.length, idx + lowerQ.length + 80);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < plain.length) snippet = snippet + '…';
  return snippet;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: '#d9770640', color: '#fcd34d', borderRadius: 2, padding: '0 2px' }}>{part}</mark>
      : part
  );
}

interface SearchResult {
  warId: string;
  warName: string;
  year: number;
  endYear: number;
  theater: string;
  tags: WarTag[];
  matchedFields: MatchField[];
}

const REGION_LABELS = ['欧州', 'アジア', '中東・アフリカ', '南北米'];
const REGION_COLORS = ['#1a4a42', '#8b3a1e', '#b8860b', '#3a5a8b'];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (q.length < 1) return [];
    const ql = q.toLowerCase();

    return WARS.flatMap(war => {
      const matchedFields: MatchField[] = [];
      const lessons = LESSONS[war.id];
      const content = WAR_CONTENT[war.id];

      // 戦争名
      if (war.name.toLowerCase().includes(ql)) {
        matchedFields.push({ label: '戦争名', snippet: war.name, emoji: '⚔️' });
      }
      // タグ
      const matchedTags = (war.tags ?? []).filter(t => t.toLowerCase().includes(ql));
      if (matchedTags.length > 0) {
        matchedFields.push({ label: 'タグ', snippet: matchedTags.join('・'), emoji: '🏷️' });
      }
      // イデオロギー
      const matchedIdeologies = (war.ideologies ?? []).filter(i => i.toLowerCase().includes(ql));
      if (matchedIdeologies.length > 0) {
        matchedFields.push({ label: 'イデオロギー', snippet: matchedIdeologies.join('・'), emoji: '💭' });
      }
      // 地域
      if (war.theater.toLowerCase().includes(ql)) {
        matchedFields.push({ label: '地域', snippet: war.theater, emoji: '🌍' });
      }
      // 教訓
      if (lessons) {
        const lessonFields: { key: keyof typeof lessons; label: string; emoji: string }[] = [
          { key: 'modernLessons', label: '現代への教訓', emoji: '💡' },
          { key: 'commonalities', label: '共通パターン', emoji: '🔗' },
          { key: 'universality', label: '普遍的メカニズム', emoji: '🌐' },
          { key: 'preventable', label: '防止可能性', emoji: '🛡️' },
          { key: 'reproducibility', label: '再現性', emoji: '⚠️' },
        ];
        for (const { key, label, emoji } of lessonFields) {
          const plain = stripHtml(String(lessons[key] ?? ''));
          if (plain.toLowerCase().includes(ql)) {
            matchedFields.push({ label, snippet: getSnippet(plain, q), emoji });
            break; // 教訓は1フィールドのみ
          }
        }
      }
      // コンテンツ（背景・aftermath）
      if (content) {
        const bgPlain = stripHtml(content.digest?.background ?? '');
        if (bgPlain.toLowerCase().includes(ql)) {
          matchedFields.push({ label: '歴史的背景', snippet: getSnippet(bgPlain, q), emoji: '🏛️' });
        }
        const afterPlain = stripHtml(content.digest?.aftermath ?? '');
        if (afterPlain.toLowerCase().includes(ql)) {
          matchedFields.push({ label: 'その後の連鎖', snippet: getSnippet(afterPlain, q), emoji: '🌊' });
        }
      }

      if (matchedFields.length === 0) return [];
      return [{
        warId: war.id,
        warName: war.name,
        year: war.year,
        endYear: war.endYear,
        theater: war.theater,
        tags: war.tags ?? [],
        matchedFields,
      }];
    });
  }, [query]);

  const POPULAR_QUERIES: string[] = [
    'ナショナリズム', '民族浄化', '核抑止', '安全保障ジレンマ',
    '経済危機', '同盟暴走', '権力真空', '誤算・誤認知',
    '宗教対立', '植民地解放', '資源争奪', '冷戦構造',
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.text }}>

      {/* ヘッダー */}
      <header style={{
        background: '#0f172a', borderBottom: `1px solid ${COLORS.border}`,
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
          <span style={{ fontSize: 9, color: '#475569', letterSpacing: '0.12em' }}>全文検索</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/lessons" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(148,163,184,0.2)' }}>
            💡 教訓一覧
          </Link>
          <Link href="/explore" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(148,163,184,0.2)' }}>
            🗺️ 探索
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

        {/* タイトル */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
            🔍 全文検索
          </h1>
          <p style={{ fontSize: 12, color: COLORS.textSub }}>
            戦争名・タグ・イデオロギー・教訓・歴史的背景まで横断検索
          </p>
        </div>

        {/* 検索ボックス */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="例：ナショナリズム、核、民族浄化、安全保障ジレンマ..."
            autoFocus
            style={{
              width: '100%', padding: '14px 50px 14px 18px', borderRadius: 8, fontSize: 15,
              background: COLORS.panel, border: `1px solid ${query ? COLORS.highlight : COLORS.border}`,
              color: COLORS.text, outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: COLORS.textSub,
            }}>×</button>
          )}
        </div>

        {/* 人気キーワード（未入力時） */}
        {!query && (
          <div>
            <div style={{ fontSize: 10, color: COLORS.textSub, marginBottom: 10, letterSpacing: '0.08em', fontWeight: 700 }}>
              よく使われる検索キーワード
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {POPULAR_QUERIES.map(q => (
                <button key={q} onClick={() => setQuery(q)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                    background: COLORS.panel, color: COLORS.textSub,
                    border: `1px solid ${COLORS.border}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.highlight; e.currentTarget.style.color = COLORS.highlight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSub; }}>
                  {q}
                </button>
              ))}
            </div>

            {/* 使い方ガイド */}
            <div style={{ marginTop: 32, padding: '16px 18px', background: COLORS.panel, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>🔍 検索できる内容</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {[
                  { emoji: '🏷️', label: '構造タグ', desc: 'ナショナリズム・核抑止・民族浄化など' },
                  { emoji: '💭', label: 'イデオロギー', desc: 'ファシズム・共産主義・民族自決など' },
                  { emoji: '💡', label: '教訓・警戒', desc: '現代への教訓・再現性・防止可能性' },
                  { emoji: '🏛️', label: '歴史的背景', desc: '戦争の原因・背景・勢力関係' },
                  { emoji: '🌐', label: '地域・戦場', desc: 'バルカン・中東・東欧・南アジアなど' },
                  { emoji: '⚔️', label: '戦争名', desc: '第一次世界大戦・朝鮮戦争など' },
                ].map(({ emoji, label, desc }) => (
                  <div key={label} style={{ padding: '8px 10px', background: COLORS.card, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>
                      {emoji} {label}
                    </div>
                    <div style={{ fontSize: 9, color: COLORS.textSub }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 検索結果 */}
        {query && (
          <>
            <div style={{ fontSize: 11, color: COLORS.textSub, marginBottom: 14 }}>
              「<strong style={{ color: COLORS.highlight }}>{query}</strong>」の検索結果：<strong style={{ color: COLORS.text }}>{results.length}</strong> 件
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: COLORS.textSub }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 13 }}>「{query}」に一致する戦争が見つかりませんでした</div>
                <div style={{ fontSize: 11, marginTop: 8 }}>別のキーワードを試してみてください</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.map(r => (
                  <div key={r.warId} style={{
                    background: COLORS.panel,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHover}
                    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                  >
                    {/* カードヘッダー */}
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                          <span className="font-serif" style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                            {highlight(r.warName, query)}
                          </span>
                          <span style={{ fontSize: 10, color: COLORS.textSub, fontVariantNumeric: 'tabular-nums' }}>
                            {r.year}–{r.endYear}
                          </span>
                          <span style={{ fontSize: 9, color: COLORS.textSub }}>{r.theater}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {r.tags.slice(0, 5).map(tag => (
                            <span key={tag} onClick={() => setQuery(tag)} style={{
                              fontSize: 9, padding: '1px 6px', borderRadius: 3, cursor: 'pointer',
                              background: tag.toLowerCase() === query.toLowerCase() ? `${COLORS.highlight}30` : 'rgba(148,163,184,0.08)',
                              color: tag.toLowerCase() === query.toLowerCase() ? '#fcd34d' : COLORS.textSub,
                              border: `1px solid ${tag.toLowerCase() === query.toLowerCase() ? COLORS.highlight : 'rgba(148,163,184,0.15)'}`,
                            }}>
                              {highlight(tag, query)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link href={`/explore?war=${r.warId}`} style={{
                        flexShrink: 0, fontSize: 10, padding: '5px 12px', borderRadius: 4,
                        background: COLORS.rust, color: '#fff', textDecoration: 'none', fontWeight: 600,
                      }}>
                        📖 詳細
                      </Link>
                    </div>

                    {/* マッチしたフィールド */}
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {r.matchedFields.slice(0, 3).map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{f.emoji}</span>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.textSub, letterSpacing: '0.08em', marginBottom: 2 }}>
                              {f.label}
                            </div>
                            <div style={{ fontSize: 11, lineHeight: 1.6, color: '#cbd5e1' }}>
                              {highlight(f.snippet, query)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {r.matchedFields.length > 3 && (
                        <div style={{ fontSize: 10, color: COLORS.textSub }}>
                          +{r.matchedFields.length - 3} 件のフィールドでも一致
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
