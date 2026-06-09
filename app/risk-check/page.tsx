'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { LESSONS } from '@/lib/lessons';
import { WarTag } from '@/lib/types';

/* ─── カラー定数 ─── */
const C = {
  bg:      '#0f172a',
  panel:   '#1e293b',
  card:    '#1a2540',
  rust:    '#8b3a1e',
  text:    '#f8fafc',
  textSub: '#94a3b8',
  border:  'rgba(248,250,252,0.08)',
};

/* ─── チェックリスト定義 ─── */
interface CheckItem {
  id: string;
  label: string;
  tag: WarTag;
  category: string;
}

const CATEGORIES: { id: string; emoji: string; title: string }[] = [
  { id: 'power',    emoji: '🔥', title: '権力構造の不安定化' },
  { id: 'social',   emoji: '⚡', title: '社会・経済的圧力' },
  { id: 'security', emoji: '🛡️', title: '安全保障の構造' },
];

const CHECK_ITEMS: CheckItem[] = [
  // 🔥 権力構造
  { id: 'p1', label: '既存の大国が急速に衰退している', tag: '帝国衰退',       category: 'power' },
  { id: 'p2', label: '権力の真空地帯が生まれている',   tag: '権力真空',       category: 'power' },
  { id: 'p3', label: '指導者が国内の政治的危機に直面している', tag: '指導者個人要因', category: 'power' },
  { id: 'p4', label: '政府の正統性が問われている（革命リスク）', tag: '革命',  category: 'power' },
  // ⚡ 社会・経済
  { id: 's1', label: '経済危機・不況・失業率の急上昇', tag: '経済危機',       category: 'social' },
  { id: 's2', label: '特定民族・宗教グループへの差別・排除が可視化されている', tag: '民族浄化', category: 'social' },
  { id: 's3', label: '「敵」の存在が国内団結に利用されている', tag: 'ナショナリズム', category: 'social' },
  { id: 's4', label: '資源（石油・水・土地）をめぐる争いがある', tag: '資源争奪', category: 'social' },
  // 🛡️ 安全保障
  { id: 'sec1', label: '相手の意図を正確に読めていない', tag: '誤算・誤認知', category: 'security' },
  { id: 'sec2', label: '同盟義務が自動的な参戦を誘発しうる', tag: '同盟暴走', category: 'security' },
  { id: 'sec3', label: '軍拡競争が起きている', tag: '安全保障ジレンマ', category: 'security' },
  { id: 'sec4', label: 'プロパガンダ・偽情報が広まっている', tag: '情報戦・プロパガンダ', category: 'security' },
  { id: 'sec5', label: '宗教・文明的対立が政治的に利用されている', tag: '宗教対立', category: 'security' },
];

/* 危険条件の説明 */
const DANGER_EXPLANATIONS: Partial<Record<WarTag, string>> = {
  '同盟暴走':         'WW1の典型。1国の局地紛争が同盟連鎖で世界大戦に拡大する。',
  '誤算・誤認知':     '相手が折れると誤読して開戦。冷戦中の核危機（キューバ等）でも繰り返された。',
  '帝国衰退':         '衰退する大国ほど「今しかない」と先制攻撃に踏み切る傾向がある。',
  '経済危機':         '国内不満のはけ口として外部への攻撃性が高まる。1930年代の教訓。',
  '権力真空':         '秩序が崩れた地域には複数の勢力が流入し、偶発的衝突が起きやすい。',
  '情報戦・プロパガンダ': '世論の戦争支持を形成し、指導者が引き返せなくなる。',
  'ナショナリズム':   '「我々 vs 彼ら」の構図が固まると、外交的妥協が国内政治的に不可能になる。',
  '指導者個人要因':   '孤立した独裁者・レームダック政治家は合理的判断より生存本能で動く。',
  '安全保障ジレンマ': '一方の防衛的増強が他方には脅威に映り、相互不信のスパイラルが生まれる。',
  '民族浄化':         '段階的エスカレーション。排除の言説が暴力を正当化し、国際介入を招く。',
  '資源争奪':         '生存に直結する資源は妥協の余地が少なく、武力解決への誘惑が強い。',
  '革命':             '体制転換期は外交的コミットメントが機能せず、周辺国が機に乗じる。',
  '宗教対立':         '聖地・正統性をめぐる対立は物質的妥協が難しく長期化しやすい。',
};

/* リスクレベル */
function getRiskLevel(score: number) {
  if (score <= 30) return { label: '低リスク',                color: '#22c55e', emoji: '🟢', bg: 'rgba(34,197,94,0.12)' };
  if (score <= 60) return { label: '中程度の注意が必要',       color: '#eab308', emoji: '🟡', bg: 'rgba(234,179,8,0.12)' };
  if (score <= 80) return { label: '高リスク — 歴史的前例多数', color: '#f97316', emoji: '🟠', bg: 'rgba(249,115,22,0.12)' };
  return                   { label: '極めて高いリスク — 複合危機', color: '#ef4444', emoji: '🔴', bg: 'rgba(239,68,68,0.15)' };
}

/* タグチップ */
function TagChip({ tag, highlight }: { tag: string; highlight?: boolean }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: highlight ? 'rgba(139,58,30,0.35)' : 'rgba(248,250,252,0.08)',
      color: highlight ? '#fca5a5' : '#94a3b8',
      border: `1px solid ${highlight ? 'rgba(239,68,68,0.4)' : 'rgba(248,250,252,0.1)'}`,
      whiteSpace: 'nowrap' as const,
    }}>
      {tag}
    </span>
  );
}

/* ─── メインページ ─── */
export default function RiskCheckPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setShowResults(false);
  };

  const score = Math.round((checked.size / CHECK_ITEMS.length) * 100);
  const risk  = getRiskLevel(score);

  /* チェック済みタグ */
  const checkedTags = useMemo<WarTag[]>(() => {
    return CHECK_ITEMS.filter(i => checked.has(i.id)).map(i => i.tag);
  }, [checked]);

  /* マッチング戦争 top5 */
  const matchedWars = useMemo(() => {
    if (checkedTags.length === 0) return [];
    return WARS
      .filter(w => w.tags && w.tags.length > 0)
      .map(w => {
        const matchTags = (w.tags ?? []).filter(t => checkedTags.includes(t));
        return { war: w, matchCount: matchTags.length, matchTags };
      })
      .filter(m => m.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.war.weight! - a.war.weight!)
      .slice(0, 5);
  }, [checkedTags]);

  /* 最も危険な条件 top2 */
  const topDangers = useMemo<CheckItem[]>(() => {
    const priority: WarTag[] = ['同盟暴走', '誤算・誤認知', '帝国衰退', '経済危機', '権力真空', '情報戦・プロパガンダ'];
    const checkedItems = CHECK_ITEMS.filter(i => checked.has(i.id));
    const sorted = [...checkedItems].sort((a, b) => {
      const ai = priority.indexOf(a.tag);
      const bi = priority.indexOf(b.tag);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return sorted.slice(0, 2);
  }, [checked]);

  /* top戦争の教訓 */
  const topLesson = matchedWars[0] ? LESSONS[matchedWars[0].war.id] : null;

  const reset = () => {
    setChecked(new Set());
    setShowResults(false);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

      {/* ── ヘッダー ── */}
      <header style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap' as const, gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{
              textDecoration: 'none', fontSize: 13, color: '#94a3b8',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ← ホーム
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '0.02em' }}>
                War Chronicle
              </span>
            </Link>
          </div>
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
            {[
              { label: '教訓一覧', href: '/lessons' },
              { label: '全文検索', href: '/search' },
              { label: '診断',     href: '/diagnose' },
            ].map(n => (
              <Link key={n.label} href={n.href} style={{
                padding: '5px 13px', borderRadius: 4, fontSize: 12,
                color: '#cbd5e1', textDecoration: 'none', fontWeight: 500,
              }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ── タイトル ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 0' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>
          🔍 戦争構造チェッカー — 危機はどう始まるか
        </h1>
        <p style={{ fontSize: 14, color: C.textSub, maxWidth: 640, lineHeight: 1.7 }}>
          現在の状況に当てはまる条件にチェックを入れると、歴史的パターンと照合します
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32, flexWrap: 'wrap' as const, alignItems: 'flex-start' }}>

        {/* ── 左：チェックリスト ── */}
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 10, marginBottom: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 18px',
                borderBottom: `1px solid ${C.border}`,
                fontSize: 13, fontWeight: 700, color: C.text,
              }}>
                {cat.emoji} {cat.title}
              </div>
              <div style={{ padding: '8px 0' }}>
                {CHECK_ITEMS.filter(i => i.category === cat.id).map(item => {
                  const isChecked = checked.has(item.id);
                  return (
                    <label key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 18px', cursor: 'pointer',
                      background: isChecked ? 'rgba(239,68,68,0.06)' : 'transparent',
                      borderLeft: isChecked ? '3px solid #ef4444' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        style={{ marginTop: 2, accentColor: '#ef4444', flexShrink: 0, width: 16, height: 16 }}
                      />
                      <div>
                        <span style={{ fontSize: 13, color: isChecked ? '#fca5a5' : C.text, lineHeight: 1.5 }}>
                          {item.label}
                        </span>
                        <span style={{
                          marginLeft: 8, fontSize: 10, color: '#64748b',
                          fontStyle: 'italic',
                        }}>
                          （{item.tag}）
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── アクションボタン ── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setShowResults(true)}
              disabled={checked.size === 0}
              style={{
                padding: '11px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700,
                background: checked.size > 0 ? '#8b3a1e' : '#374151',
                color: checked.size > 0 ? '#fff' : '#6b7280',
                border: 'none', cursor: checked.size > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              🔎 分析する（{checked.size}/{CHECK_ITEMS.length}）
            </button>
            <button
              onClick={reset}
              style={{
                padding: '11px 20px', borderRadius: 6, fontSize: 13,
                background: 'transparent', color: C.textSub,
                border: `1px solid ${C.border}`, cursor: 'pointer',
              }}
            >
              リセット
            </button>
          </div>
        </div>

        {/* ── 右：結果パネル ── */}
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>

          {/* スコアゲージ（常時表示） */}
          <div style={{
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: 24, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: C.textSub, letterSpacing: '0.1em', marginBottom: 12 }}>
              リスクスコア
            </div>
            {/* バーゲージ */}
            <div style={{
              height: 10, borderRadius: 5,
              background: 'rgba(248,250,252,0.08)', overflow: 'hidden', marginBottom: 16,
            }}>
              <div style={{
                height: '100%', borderRadius: 5,
                width: `${score}%`,
                background: score <= 30 ? '#22c55e' : score <= 60 ? '#eab308' : score <= 80 ? '#f97316' : '#ef4444',
                transition: 'width 0.4s ease, background 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: risk.color, lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: 16, color: C.textSub }}>%</span>
            </div>
            <div style={{
              marginTop: 10, padding: '8px 14px', borderRadius: 6,
              background: risk.bg, border: `1px solid ${risk.color}40`,
              fontSize: 13, fontWeight: 600, color: risk.color,
            }}>
              {risk.emoji} {risk.label}
            </div>
          </div>

          {/* 結果（分析ボタン後） */}
          {showResults && checked.size > 0 && (
            <>
              {/* 最重要警告 */}
              {topDangers.length > 0 && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: 18, marginBottom: 16,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 12 }}>
                    ⚠️ 最も危険な条件
                  </div>
                  {topDangers.map(d => (
                    <div key={d.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5', marginBottom: 4 }}>
                        {d.tag}
                      </div>
                      <p style={{ fontSize: 12, color: '#fecaca', lineHeight: 1.6, margin: 0 }}>
                        {DANGER_EXPLANATIONS[d.tag] ?? '歴史的に繰り返された危険な構造条件です。'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* マッチした歴史的戦争 */}
              {matchedWars.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.textSub, letterSpacing: '0.1em', marginBottom: 10 }}>
                    🏛️ 歴史的パターンとの照合（上位{matchedWars.length}件）
                  </div>
                  {matchedWars.map(({ war, matchCount, matchTags }) => (
                    <div key={war.id} style={{
                      background: C.card, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '14px 16px', marginBottom: 10,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                            {war.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                            {war.year > 0 ? war.year : `BC${Math.abs(war.year)}`}–{war.endYear > 0 ? war.endYear : `BC${Math.abs(war.endYear)}`} | {war.theater}
                          </div>
                        </div>
                        <span style={{
                          padding: '3px 9px', borderRadius: 4,
                          background: 'rgba(139,58,30,0.3)',
                          color: '#fca5a5', fontSize: 12, fontWeight: 700,
                          flexShrink: 0, marginLeft: 8,
                        }}>
                          {matchCount}条件一致
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 8 }}>
                        {matchTags.map(t => <TagChip key={t} tag={t} highlight />)}
                        {(war.tags ?? []).filter(t => !matchTags.includes(t)).map(t => (
                          <TagChip key={t} tag={t} />
                        ))}
                      </div>
                      <Link href={`/explore?war=${war.id}`} style={{
                        fontSize: 11, color: '#64748b', textDecoration: 'none',
                      }}>
                        詳細を見る →
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* 教訓スニペット */}
              {topLesson && (
                <div style={{
                  background: C.panel, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: 18,
                }}>
                  <div style={{ fontSize: 11, color: C.textSub, letterSpacing: '0.1em', marginBottom: 10 }}>
                    💡 最もパターンが近い戦争からの教訓
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
                    {topLesson.modernLessons.replace(/<[^>]*>/g, '').substring(0, 300)}
                    {topLesson.modernLessons.length > 300 && '…'}
                  </div>
                  <Link href={`/explore?war=${matchedWars[0].war.id}`} style={{
                    display: 'inline-block', marginTop: 10,
                    fontSize: 11, color: '#8b3a1e', textDecoration: 'none', fontWeight: 600,
                  }}>
                    全教訓を読む →
                  </Link>
                </div>
              )}

              {matchedWars.length === 0 && (
                <div style={{
                  background: C.panel, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: 24, textAlign: 'center' as const,
                  color: C.textSub, fontSize: 13,
                }}>
                  選択した条件に合致する歴史的戦争が見つかりませんでした
                </div>
              )}
            </>
          )}

          {!showResults && checked.size === 0 && (
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: 24, color: C.textSub,
              fontSize: 13, lineHeight: 1.7,
            }}>
              <p style={{ margin: '0 0 8px' }}>← 左のチェックリストで当てはまる条件を選んでください。</p>
              <p style={{ margin: 0 }}>チェック後に「分析する」を押すと、歴史的パターンと照合します。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
