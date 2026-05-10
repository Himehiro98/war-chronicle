'use client';

import Link from 'next/link';
import Hero from '@/components/Hero';
import LearningPathCard from '@/components/LearningPathCard';
import ThemeCard from '@/components/ThemeCard';
import ReligionCard from '@/components/ReligionCard';
import TagCloud from '@/components/TagCloud';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { RELIGION_THEMES } from '@/lib/religion-themes';

export default function Home() {
  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>

      {/* ── ヘッダー ── */}
      <header style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(248,250,252,0.08)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="font-serif" style={{
              fontSize: 18, fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em',
            }}>
              War Chronicle
            </span>
            <span style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.15em' }}>
              多角的戦争史データベース
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { label: '学ぶ',         href: '#learning-paths', emoji: '🎓' },
              { label: 'テーマ',       href: '#modern-themes',  emoji: '🌐' },
              { label: '宗教',         href: '#religions',      emoji: '🕊️' },
              { label: 'パターン',     href: '#patterns',       emoji: '🧬' },
              { label: 'ネットワーク', href: '/network',        emoji: '🕸️' },
              { label: '探索',         href: '/explore',        emoji: '🗺️' },
            ].map((n) => (
              <a key={n.label} href={n.href} style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 12,
                color: '#cbd5e1', textDecoration: 'none', letterSpacing: '0.04em',
                fontWeight: 500, transition: 'all 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,250,252,0.06)'; e.currentTarget.style.color = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}>
                <span>{n.emoji}</span>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── ヒーロー ── */}
      <Hero />

      {/* ── Section 1: 学習パス ── */}
      <section id="learning-paths" style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.2em', color: '#1e40af',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
          }}>
            🎓 LEARNING PATHS
          </div>
          <h2 className="font-serif" style={{
            fontSize: 32, fontWeight: 700, color: '#0f172a',
            lineHeight: 1.3, marginBottom: 12,
          }}>
            まず読むべき5本のパス
          </h2>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
            100戦争を前にした「どこから読めば？」に答える。<strong>キュレーションされた読み順</strong>で、
            20世紀の世界秩序、現代中国、中東、冷戦、戦争発生パターンを体系的に押さえる。
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {LEARNING_PATHS.map((p) => (
            <LearningPathCard key={p.id} path={p} />
          ))}
        </div>
      </section>

      {/* ── Section 2: 現代テーマ ── */}
      <section id="modern-themes" style={{
        background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
        padding: '80px 32px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.2em', color: '#0f766e',
              textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
            }}>
              🌐 MODERN THEMES
            </div>
            <h2 className="font-serif" style={{
              fontSize: 32, fontWeight: 700, color: '#0f172a',
              lineHeight: 1.3, marginBottom: 12,
            }}>
              現代の問いから歴史を読む
            </h2>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
              「なぜロシアはNATOを恐れるのか」「なぜ台湾問題が起きるのか」
              <br />
              現代の<strong>具体的な問い</strong>から出発し、過去の戦争・植民地・冷戦構造の堆積として読み解く。
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {MODERN_THEMES.map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2.5: 宗教から歴史を読む ── */}
      <section id="religions" style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#7c2d12', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            🕊️ HISTORY THROUGH RELIGION
          </div>
          <h2 className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 12 }}>
            宗教から歴史を読み解く
          </h2>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
            ユダヤ教・キリスト教・イスラム教・ヒンドゥー教・仏教——
            <br />
            主要5宗教を軸に3500年の戦争史を貫く。<strong>宗教は戦争の原因か、それとも戦争の言語か。</strong>
          </p>
        </div>

        {RELIGION_THEMES.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fafaf9', borderRadius: 8, color: '#94a3b8', fontSize: 12 }}>
            🕊️ 宗教テーマを準備中だワン...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {RELIGION_THEMES.map((t) => (
              <ReligionCard key={t.id} theme={t} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: パターン ── */}
      <section id="patterns" style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.2em', color: '#7c3aed',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
          }}>
            🧬 STRUCTURAL PATTERNS
          </div>
          <h2 className="font-serif" style={{
            fontSize: 32, fontWeight: 700, color: '#0f172a',
            lineHeight: 1.3, marginBottom: 12,
          }}>
            戦争の構造パターン
          </h2>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
            戦争を「英雄譚」ではなく「<strong>再現可能な構造</strong>」として理解する21の分類軸。
            タグをクリックすると、メカニズム解説と該当戦争一覧が表示される。
          </p>
        </div>

        <TagCloud />
      </section>

      {/* ── Section 4: CTA - Explorer へ ── */}
      <section style={{
        background: '#0f172a',
        color: '#f8fafc',
        padding: '80px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.2em', color: '#fbbf24',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
          }}>
            🗺️ FULL EXPLORER
          </div>
          <h2 className="font-serif" style={{
            fontSize: 32, fontWeight: 700, lineHeight: 1.3, marginBottom: 16,
          }}>
            すべての戦争を時系列・地図で探索する
          </h2>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 28 }}>
            年表 × 世界地図 × 詳細パネルが連動する完全エクスプローラ。
            <br />
            BC1457〜2025の<strong style={{ color: '#fbbf24' }}>167戦争</strong>を時系列で俯瞰し、地図で位置を確認し、各戦争の構造分析・教訓・市民視点を深掘り。
          </p>
          <Link href="/explore" style={{
            display: 'inline-block',
            padding: '14px 32px', borderRadius: 4,
            background: '#fbbf24', color: '#0f172a',
            fontWeight: 700, fontSize: 13, letterSpacing: '0.05em',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>
            エクスプローラを開く →
          </Link>
        </div>
      </section>

      {/* ── フッター ── */}
      <footer style={{
        background: '#020617', color: '#64748b',
        padding: '40px 32px', borderTop: '1px solid rgba(248,250,252,0.06)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              flexShrink: 0, width: 64, height: 64, borderRadius: '50%',
              overflow: 'hidden', background: '#fef3c7',
              border: '2px solid #fbbf24',
            }}>
              <img src="/wanta.png" alt="わんた"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="font-serif" style={{ fontSize: 14, color: '#f8fafc', fontWeight: 700, marginBottom: 4 }}>
                War Chronicle
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.7 }}>
                戦争を「英雄譚」ではなく、人類社会の構造・安全保障・ナショナリズム・経済・情報・地政学・集団心理が交差する場として、多面的に分析するための知的教養プラットフォーム。
                <br /><br />
                政治的プロパガンダ化を避けるため、当事国・市民・国際政治・後世評価・複数解釈を並列で表示しています。
                単純善悪では語りません。
              </p>
            </div>
          </div>
          <div style={{
            marginTop: 28, paddingTop: 20,
            borderTop: '1px solid rgba(248,250,252,0.06)',
            fontSize: 10, color: '#475569',
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <span>© War Chronicle</span>
            <span>戦争は突然起きない。人類は似た条件で何度も衝突してきた。</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
