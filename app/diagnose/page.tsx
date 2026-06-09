'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

// ── カラー定数 ──
const C = {
  bg: '#0f172a',
  panel: '#1e293b',
  card: '#1a2540',
  rust: '#8b3a1e',
  text: '#f8fafc',
  textSub: '#94a3b8',
  border: 'rgba(248,250,252,0.08)',
  amber: '#d97706',
};

// ── 型定義 ──
interface MatchItem {
  warId: string;
  warName: string;
  score: number;
  matchedFactors: string[];
  reasoning: string;
  warningSign: string;
}

interface DiagnoseResult {
  matches: MatchItem[];
  overallRisk: 'high' | 'medium' | 'low';
  summary: string;
}

// ── スコアバーの色 ──
function scoreColor(score: number): string {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
}

// ── リスクバッジ ──
function RiskBadge({ risk }: { risk: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', label: '⚠️ 高リスク', color: '#ef4444' },
    medium: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', label: '⚡ 中程度のリスク', color: '#f59e0b' },
    low: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', label: '✅ 低リスク', color: '#22c55e' },
  };
  const c = config[risk];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 8, padding: '10px 20px',
      color: c.color, fontWeight: 700, fontSize: 18,
    }}>
      {c.label}
    </div>
  );
}

// ── マッチカード ──
function MatchCard({ match, index }: { match: MatchItem; index: number }) {
  const color = scoreColor(match.score);
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* ヘッダー：順位 + 戦争名 + スコア */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: C.rust, color: C.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <div>
            <Link
              href={`/explore?war=${match.warId}`}
              style={{
                color: C.text, fontWeight: 700, fontSize: 20,
                textDecoration: 'none', display: 'block',
              }}
              onMouseOver={e => (e.currentTarget.style.color = C.amber)}
              onMouseOut={e => (e.currentTarget.style.color = C.text)}
            >
              {match.warName}
            </Link>
          </div>
        </div>
        <div style={{
          background: 'rgba(248,250,252,0.05)',
          border: `1px solid ${color}40`,
          borderRadius: 8, padding: '6px 14px',
          color: color, fontWeight: 700, fontSize: 20,
          flexShrink: 0,
        }}>
          {match.score}%
        </div>
      </div>

      {/* スコアバー */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: C.textSub, letterSpacing: '0.05em' }}>類似度スコア</div>
        <div style={{
          height: 8, background: 'rgba(248,250,252,0.08)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${match.score}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* マッチした構造タグ */}
      {match.matchedFactors && match.matchedFactors.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {match.matchedFactors.map((factor) => (
            <span key={factor} style={{
              background: `${C.rust}30`,
              border: `1px solid ${C.rust}60`,
              color: '#fca5a5',
              borderRadius: 6, padding: '3px 10px',
              fontSize: 12, fontWeight: 500,
            }}>
              {factor}
            </span>
          ))}
        </div>
      )}

      {/* 類似理由 */}
      <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {match.reasoning}
      </p>

      {/* 警告サイン */}
      <div style={{
        background: 'rgba(217,119,6,0.1)',
        border: `1px solid rgba(217,119,6,0.3)`,
        borderRadius: 8, padding: '12px 16px',
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚡</span>
        <div>
          <div style={{ color: C.amber, fontWeight: 700, fontSize: 12, marginBottom: 4, letterSpacing: '0.05em' }}>
            最も注意すべき類似点
          </div>
          <p style={{ color: '#fde68a', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {match.warningSign}
          </p>
        </div>
      </div>

      {/* 詳細リンク */}
      <div style={{ textAlign: 'right' }}>
        <Link
          href={`/explore?war=${match.warId}`}
          style={{
            color: C.amber, fontSize: 13, textDecoration: 'none',
            fontWeight: 500,
          }}
          onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          この戦争を詳しく見る →
        </Link>
      </div>
    </div>
  );
}

// ── ローディングドット ──
function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: C.amber,
            animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
}

// ── サンプルボタン ──
const EXAMPLES = ['台湾海峡の緊張', 'イラン核問題', '中東の宗派対立', '欧州の右翼台頭'];

// ── メインページ ──
export default function DiagnosePage() {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!situation.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '分析中にエラーが発生しました');
        return;
      }

      setResult(data);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  }, [situation, loading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  }, [handleSubmit]);

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
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{
              color: C.textSub, fontSize: 13, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
              onMouseOver={e => (e.currentTarget.style.color = C.text)}
              onMouseOut={e => (e.currentTarget.style.color = C.textSub)}
            >
              ← ホーム
            </Link>
            <span style={{ color: C.border }}>|</span>
            <Link href="/" style={{
              color: C.text, fontWeight: 700, fontSize: 16,
              textDecoration: 'none', letterSpacing: '0.05em',
            }}>
              War Chronicle
            </Link>
          </div>
          <nav style={{ display: 'flex', gap: 20 }}>
            <Link href="/lessons" style={{
              color: C.textSub, fontSize: 13, textDecoration: 'none',
              fontWeight: 500,
            }}
              onMouseOver={e => (e.currentTarget.style.color = C.text)}
              onMouseOut={e => (e.currentTarget.style.color = C.textSub)}
            >
              教訓
            </Link>
            <Link href="/search" style={{
              color: C.textSub, fontSize: 13, textDecoration: 'none',
              fontWeight: 500,
            }}
              onMouseOver={e => (e.currentTarget.style.color = C.text)}
              onMouseOut={e => (e.currentTarget.style.color = C.textSub)}
            >
              検索
            </Link>
          </nav>
        </div>
      </header>

      {/* ── メインコンテンツ ── */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* タイトルセクション */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔮</div>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: 800, margin: '0 0 12px',
            color: C.text, letterSpacing: '-0.02em',
          }}>
            AIパターン診断
          </h1>
          <p style={{
            fontSize: 'clamp(20px, 3.5vw, 28px)',
            color: C.amber, fontWeight: 700, margin: '0 0 16px',
          }}>
            今の世界は何番煎じ？
          </p>
          <p style={{
            color: C.textSub, fontSize: 15, lineHeight: 1.7,
            maxWidth: 600, margin: '0 auto',
          }}>
            現在進行中の地政学的状況を入力すると、AIが歴史上の戦争との
            構造的類似性を分析します
          </p>
        </div>

        {/* 入力セクション */}
        <div style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 28,
          marginBottom: 32,
        }}>
          {/* クイックフィルボタン */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: C.textSub, fontSize: 12, marginBottom: 8, letterSpacing: '0.05em', fontWeight: 500 }}>
              例から選ぶ：
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setSituation(ex)}
                  style={{
                    background: situation === ex
                      ? `${C.rust}40`
                      : 'rgba(248,250,252,0.05)',
                    border: `1px solid ${situation === ex ? C.rust : C.border}`,
                    color: situation === ex ? '#fca5a5' : C.textSub,
                    borderRadius: 8, padding: '6px 14px',
                    fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: 500,
                  }}
                  onMouseOver={e => {
                    if (situation !== ex) {
                      e.currentTarget.style.borderColor = C.rust + '80';
                      e.currentTarget.style.color = C.text;
                    }
                  }}
                  onMouseOut={e => {
                    if (situation !== ex) {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.textSub;
                    }
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* テキストエリア */}
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例：「ある大国が隣国の資源豊富な地域に軍事的圧力をかけており、周辺国が同盟を組んで対抗しようとしている。経済制裁の応酬が激化し、民族主義的な世論が高まっている...」"
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(248,250,252,0.04)',
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '14px 16px',
              color: C.text, fontSize: 14, lineHeight: 1.7,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.amber + '80')}
            onBlur={e => (e.currentTarget.style.borderColor = C.border)}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ color: C.textSub, fontSize: 12 }}>
              Ctrl + Enter でも送信できます
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || !situation.trim()}
              style={{
                background: loading || !situation.trim()
                  ? 'rgba(139,58,30,0.3)'
                  : `linear-gradient(135deg, ${C.rust}, #c0521f)`,
                border: 'none',
                color: loading || !situation.trim() ? C.textSub : C.text,
                borderRadius: 10, padding: '12px 28px',
                fontSize: 15, fontWeight: 700, cursor: loading || !situation.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
              }}
            >
              {loading ? (
                <>
                  <LoadingDots />
                  <span>分析中...</span>
                </>
              ) : (
                '🔮 AIで分析する'
              )}
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '14px 18px',
            color: '#fca5a5', fontSize: 14,
            marginBottom: 24,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div>
            {/* 総合リスク */}
            <div style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '24px 28px',
              marginBottom: 28,
            }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  color: C.textSub, fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}>
                  総合リスク評価
                </h2>
                <RiskBadge risk={result.overallRisk} />
              </div>
              <p style={{
                color: C.textSub, fontSize: 15, lineHeight: 1.8, margin: 0,
              }}>
                {result.summary}
              </p>
            </div>

            {/* マッチした戦争一覧 */}
            <div>
              <h2 style={{
                color: C.textSub, fontSize: 12, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                margin: '0 0 16px',
              }}>
                類似した歴史的戦争 — {result.matches.length}件
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.matches.map((match, i) => (
                  <MatchCard key={match.warId || i} match={match} index={i} />
                ))}
              </div>
            </div>

            {/* 再分析ボタン */}
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => {
                  setResult(null);
                  setSituation('');
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  color: C.textSub, borderRadius: 10,
                  padding: '12px 28px', fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = C.amber;
                  e.currentTarget.style.color = C.text;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.textSub;
                }}
              >
                別の状況を分析する
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
