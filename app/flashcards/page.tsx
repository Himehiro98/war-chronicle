'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { LESSONS } from '@/lib/lessons';

// ─── 型定義 ───────────────────────────────────────────────
interface Card {
  id: string;
  warId: string;
  warName: string;
  era: string;
  question: string;
  answer: string;
  type: 'year' | 'region' | 'tags' | 'lesson';
}

interface CardProgress {
  known: boolean;
  lastSeen: number;
  seenCount: number;
}

type ProgressMap = Record<string, CardProgress>;
type FilterType = 'all' | 'unknown' | 'known';

// ─── 定数 ─────────────────────────────────────────────────
const STORAGE_KEY = 'war-chronicle-flashcards-v1';

const C = {
  bg: '#0f172a',
  panel: '#1e293b',
  card: '#1a2540',
  rust: '#8b3a1e',
  teal: '#1a4a42',
  amber: '#d97706',
  text: '#f8fafc',
  textSub: '#94a3b8',
  border: 'rgba(248,250,252,0.08)',
  green: '#22c55e',
  red: '#ef4444',
};

const ERA_LABELS: Record<string, string> = {
  prehistoric: '先史',
  ancient: '古代',
  medieval: '中世',
  renaissance: 'ルネサンス',
  'early-modern': '近世',
  '20th-century': '20世紀',
  contemporary: '現代',
};

// ─── ユーティリティ ────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── カード生成 ────────────────────────────────────────────
function generateCards(shuffleSeed: number): Card[] {
  const cards: Card[] = [];

  for (const war of WARS) {
    // Type 1: 年代問題
    cards.push({
      id: `${war.id}-year`,
      warId: war.id,
      warName: war.name,
      era: war.era,
      question: `「${war.name}」はいつ始まった？`,
      answer: `${war.year}年（${war.endYear}年終結）`,
      type: 'year',
    });

    // Type 2: 地域問題
    cards.push({
      id: `${war.id}-region`,
      warId: war.id,
      warName: war.name,
      era: war.era,
      question: `「${war.name}」はどの地域で起きた？`,
      answer: war.theater,
      type: 'region',
    });

    // Type 3: タグ問題
    if (war.tags && war.tags.length > 0) {
      cards.push({
        id: `${war.id}-tags`,
        warId: war.id,
        warName: war.name,
        era: war.era,
        question: `「${war.name}」の主要な構造的要因は？`,
        answer: war.tags.slice(0, 3).join('・'),
        type: 'tags',
      });
    }

    // Type 4: 教訓問題
    const lesson = LESSONS[war.id];
    if (lesson?.modernLessons) {
      const snippet = stripHtml(lesson.modernLessons).slice(0, 100);
      cards.push({
        id: `${war.id}-lesson`,
        warId: war.id,
        warName: war.name,
        era: war.era,
        question: `「${war.name}」から現代が学ぶべき教訓は？`,
        answer: snippet + '…',
        type: 'lesson',
      });
    }
  }

  return seededShuffle(cards, shuffleSeed);
}

// ─── カード優先度ソート ────────────────────────────────────
function sortByPriority(cards: Card[], progress: ProgressMap): Card[] {
  const unknown: Card[] = [];
  const unseen: Card[] = [];
  const known: Card[] = [];

  for (const card of cards) {
    const p = progress[card.id];
    if (!p) {
      unseen.push(card);
    } else if (!p.known) {
      unknown.push(card);
    } else {
      known.push(card);
    }
  }

  return [...unknown, ...unseen, ...known];
}

// ─── メインコンポーネント ──────────────────────────────────
export default function FlashcardsPage() {
  const [shuffleSeed, setShuffleSeed] = useState(42);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [eraFilter, setEraFilter] = useState<string>('all');
  const [resetConfirm, setResetConfirm] = useState(false);

  // localStorage からロード
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {
      // ignore
    }
    setProgressLoaded(true);
  }, []);

  // localStorage へ保存
  useEffect(() => {
    if (!progressLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress, progressLoaded]);

  // カード生成（useMemo）
  const allCards = useMemo(() => generateCards(shuffleSeed), [shuffleSeed]);

  // フィルタ適用
  const filteredCards = useMemo(() => {
    let cards = allCards;

    if (eraFilter !== 'all') {
      cards = cards.filter((c) => c.era === eraFilter);
    }

    if (filter === 'unknown') {
      cards = cards.filter((c) => {
        const p = progress[c.id];
        return !p || !p.known;
      });
    } else if (filter === 'known') {
      cards = cards.filter((c) => {
        const p = progress[c.id];
        return p && p.known;
      });
    }

    return sortByPriority(cards, progress);
  }, [allCards, filter, eraFilter, progress]);

  const currentCard = filteredCards[currentIndex] ?? null;

  // 統計
  const stats = useMemo(() => {
    const total = allCards.length;
    let known = 0;
    let unknown = 0;
    let unseen = 0;

    for (const card of allCards) {
      const p = progress[card.id];
      if (!p) unseen++;
      else if (p.known) known++;
      else unknown++;
    }

    return { total, known, unknown, unseen };
  }, [allCards, progress]);

  // ナビゲーション
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, filteredCards.length - 1));
    setShowAnswer(false);
  }, [filteredCards.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setShowAnswer(false);
  }, []);

  // 回答記録
  const markCard = useCallback(
    (known: boolean) => {
      if (!currentCard) return;
      setProgress((prev) => ({
        ...prev,
        [currentCard.id]: {
          known,
          lastSeen: Date.now(),
          seenCount: (prev[currentCard.id]?.seenCount ?? 0) + 1,
        },
      }));
      goNext();
    },
    [currentCard, goNext]
  );

  // キーボード操作
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // テキスト入力中は無視
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setShowAnswer((v) => !v);
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case '1':
          if (showAnswer) markCard(true);
          break;
        case '2':
          if (showAnswer) markCard(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showAnswer, goNext, goPrev, markCard]);

  // シャッフル
  const handleShuffle = () => {
    setShuffleSeed(Math.floor(Math.random() * 99999));
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  // リセット
  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    setProgress({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setResetConfirm(false);
  };

  // フィルタ変更時にインデックスリセット
  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleEraChange = (era: string) => {
    setEraFilter(era);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  // 既存エラリスト
  const availableEras = useMemo(() => {
    const eras = new Set(allCards.map((c) => c.era));
    return Array.from(eras);
  }, [allCards]);

  const knownRatio =
    stats.total > 0 ? (stats.known / stats.total) * 100 : 0;

  const typeLabel: Record<string, string> = {
    year: '📅 年代',
    region: '🌏 地域',
    tags: '🧬 構造要因',
    lesson: '💡 教訓',
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      {/* ── ヘッダー ── */}
      <header
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                color: C.textSub,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← ホーム
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: '0.02em',
                }}
              >
                War Chronicle
              </span>
              <span
                style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.15em' }}
              >
                多角的戦争史データベース
              </span>
            </Link>
          </div>
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: '教訓一覧', href: '/lessons' },
              { label: '全文検索', href: '/search' },
            ].map((n) => (
              <Link
                key={n.label}
                href={n.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: C.textSub,
                  textDecoration: 'none',
                  border: `1px solid ${C.border}`,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ── メインコンテンツ ── */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        {/* タイトル */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              marginBottom: 6,
            }}
          >
            🃏 フラッシュカード学習
          </h1>
          <p style={{ color: C.textSub, fontSize: 13, margin: 0 }}>
            スペース：答えを見る　← →：移動　1：わかった　2：もう一度
          </p>
        </div>

        {/* 進捗バー */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: C.textSub,
              marginBottom: 6,
            }}
          >
            <span>習得進捗</span>
            <span>
              {stats.known} / {stats.total} ({Math.round(knownRatio)}%)
            </span>
          </div>
          <div
            style={{
              background: C.panel,
              borderRadius: 99,
              height: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${knownRatio}%`,
                height: '100%',
                background: C.green,
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* フィルターバー */}
        <div style={{ marginBottom: 20 }}>
          {/* 状態フィルタ */}
          <div
            style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
          >
            {(
              [
                { key: 'all', label: 'すべて' },
                { key: 'unknown', label: '未習・もう一度' },
                { key: 'known', label: '習得済み' },
              ] as { key: FilterType; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: `1px solid ${filter === key ? C.amber : C.border}`,
                  background:
                    filter === key ? 'rgba(217,119,6,0.15)' : 'transparent',
                  color: filter === key ? C.amber : C.textSub,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: filter === key ? 600 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 時代フィルタ */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleEraChange('all')}
              style={{
                padding: '4px 12px',
                borderRadius: 12,
                border: `1px solid ${eraFilter === 'all' ? '#7dd3fc' : C.border}`,
                background:
                  eraFilter === 'all' ? 'rgba(125,211,252,0.12)' : 'transparent',
                color: eraFilter === 'all' ? '#7dd3fc' : C.textSub,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              全時代
            </button>
            {availableEras.map((era) => (
              <button
                key={era}
                onClick={() => handleEraChange(era)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  border: `1px solid ${
                    eraFilter === era ? '#7dd3fc' : C.border
                  }`,
                  background:
                    eraFilter === era
                      ? 'rgba(125,211,252,0.12)'
                      : 'transparent',
                  color: eraFilter === era ? '#7dd3fc' : C.textSub,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {ERA_LABELS[era] ?? era}
              </button>
            ))}
          </div>
        </div>

        {/* カード表示エリア */}
        {filteredCards.length === 0 ? (
          <div
            style={{
              background: C.panel,
              borderRadius: 16,
              padding: '60px 40px',
              textAlign: 'center',
              color: C.textSub,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0 }}>
              このフィルターに該当するカードがないばい
            </p>
          </div>
        ) : currentCard ? (
          <div>
            {/* ナビゲーション（上） */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginBottom: 16,
              }}
            >
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: currentIndex === 0 ? '#334155' : C.textSub,
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                }}
              >
                ←
              </button>
              <span style={{ color: C.textSub, fontSize: 14 }}>
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <button
                onClick={goNext}
                disabled={currentIndex === filteredCards.length - 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color:
                    currentIndex === filteredCards.length - 1
                      ? '#334155'
                      : C.textSub,
                  cursor:
                    currentIndex === filteredCards.length - 1
                      ? 'not-allowed'
                      : 'pointer',
                  fontSize: 16,
                }}
              >
                →
              </button>
            </div>

            {/* カード本体 */}
            <div
              style={{
                background: C.panel,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                padding: '40px 40px 32px',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* ヘッダー情報 */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: 'rgba(217,119,6,0.15)',
                    color: C.amber,
                    border: `1px solid rgba(217,119,6,0.3)`,
                  }}
                >
                  {typeLabel[currentCard.type] ?? currentCard.type}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: 'rgba(125,211,252,0.08)',
                    color: '#7dd3fc',
                    border: `1px solid rgba(125,211,252,0.2)`,
                  }}
                >
                  {ERA_LABELS[currentCard.era] ?? currentCard.era}
                </span>
                {(() => {
                  const p = progress[currentCard.id];
                  if (!p) return null;
                  return (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 12,
                        background: p.known
                          ? 'rgba(34,197,94,0.12)'
                          : 'rgba(239,68,68,0.12)',
                        color: p.known ? C.green : C.red,
                        border: `1px solid ${
                          p.known
                            ? 'rgba(34,197,94,0.3)'
                            : 'rgba(239,68,68,0.3)'
                        }`,
                      }}
                    >
                      {p.known ? '✅ 習得済み' : '🔁 もう一度'}
                    </span>
                  );
                })()}
              </div>

              {/* 戦争名 */}
              <div
                style={{
                  fontSize: 13,
                  color: C.textSub,
                  borderLeft: `3px solid ${C.amber}`,
                  paddingLeft: 12,
                }}
              >
                {currentCard.warName}
              </div>

              {/* 問題文 */}
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: C.text,
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {currentCard.question}
              </div>

              {/* 答えを見る / 答え */}
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 10,
                    border: `1px solid ${C.amber}`,
                    background: 'rgba(217,119,6,0.1)',
                    color: C.amber,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    alignSelf: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(217,119,6,0.2)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(217,119,6,0.1)')
                  }
                >
                  答えを見る（スペース）
                </button>
              ) : (
                <div>
                  {/* 答え表示 */}
                  <div
                    style={{
                      background: C.card,
                      borderRadius: 10,
                      padding: '20px 24px',
                      marginBottom: 20,
                      borderLeft: `4px solid ${C.green}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: C.green,
                        marginBottom: 8,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      答え
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        color: C.text,
                        lineHeight: 1.7,
                        fontWeight: 500,
                      }}
                    >
                      {currentCard.answer}
                    </div>
                  </div>

                  {/* 評価ボタン */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      onClick={() => markCard(true)}
                      style={{
                        flex: 1,
                        maxWidth: 220,
                        padding: '14px 20px',
                        borderRadius: 10,
                        border: `1px solid ${C.green}`,
                        background: 'rgba(34,197,94,0.12)',
                        color: C.green,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'rgba(34,197,94,0.22)')
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'rgba(34,197,94,0.12)')
                      }
                    >
                      ✅ わかった（1）
                    </button>
                    <button
                      onClick={() => markCard(false)}
                      style={{
                        flex: 1,
                        maxWidth: 220,
                        padding: '14px 20px',
                        borderRadius: 10,
                        border: `1px solid ${C.amber}`,
                        background: 'rgba(217,119,6,0.12)',
                        color: C.amber,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'rgba(217,119,6,0.22)')
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'rgba(217,119,6,0.12)')
                      }
                    >
                      🔁 もう一度（2）
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* アクションボタン */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginTop: 24,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleShuffle}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textSub,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🔀 シャッフル
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: `1px solid ${resetConfirm ? C.red : C.border}`,
              background: resetConfirm ? 'rgba(239,68,68,0.12)' : 'transparent',
              color: resetConfirm ? C.red : C.textSub,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {resetConfirm ? '⚠️ 本当にリセット？' : '🗑️ 進捗リセット'}
          </button>
          {resetConfirm && (
            <button
              onClick={() => setResetConfirm(false)}
              style={{
                padding: '9px 20px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.textSub,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              キャンセル
            </button>
          )}
        </div>

        {/* 統計セクション */}
        <div
          style={{
            marginTop: 40,
            background: C.panel,
            borderRadius: 12,
            padding: '20px 28px',
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
            border: `1px solid ${C.border}`,
          }}
        >
          <StatBadge color="#7dd3fc" label="未習" count={stats.unseen} />
          <StatBadge color={C.red} label="もう一度" count={stats.unknown} />
          <StatBadge color={C.green} label="習得" count={stats.known} />
          <StatBadge color={C.textSub} label="総カード数" count={stats.total} />
        </div>
      </main>
    </div>
  );
}

// ─── 統計バッジコンポーネント ─────────────────────────────
function StatBadge({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div style={{ textAlign: 'center', minWidth: 72 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}
