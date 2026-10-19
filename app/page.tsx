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


      {/* ── ヒーロー ── */}
      <Hero />

      {/* ── Section 1: 学習パス ── */}
      <section id="learning-paths" style={{ padding: '80px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 12, letterSpacing: '0.2em', color: '#1e40af',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
          }}>
            🎓 LEARNING PATHS
          </div>
          <h2 className="font-serif" style={{
            fontSize: 37, fontWeight: 700, color: '#0f172a',
            lineHeight: 1.3, marginBottom: 12,
          }}>
            まず読むべき5本のパス
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
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
              fontSize: 12, letterSpacing: '0.2em', color: '#0f766e',
              textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
            }}>
              🌐 MODERN THEMES
            </div>
            <h2 className="font-serif" style={{
              fontSize: 37, fontWeight: 700, color: '#0f172a',
              lineHeight: 1.3, marginBottom: 12,
            }}>
              現代の問いから歴史を読む
            </h2>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
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
          <div style={{ fontSize: 12, letterSpacing: '0.2em', color: '#7c2d12', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            🕊️ HISTORY THROUGH RELIGION
          </div>
          <h2 className="font-serif" style={{ fontSize: 37, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 12 }}>
            宗教から歴史を読み解く
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
            ユダヤ教・キリスト教・イスラム教・ヒンドゥー教・仏教——
            <br />
            主要5宗教を軸に3500年の戦争史を貫く。<strong>宗教は戦争の原因か、それとも戦争の言語か。</strong>
          </p>
        </div>

        {RELIGION_THEMES.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fafaf9', borderRadius: 8, color: '#94a3b8', fontSize: 14 }}>
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
            fontSize: 12, letterSpacing: '0.2em', color: '#7c3aed',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 8,
          }}>
            🧬 STRUCTURAL PATTERNS
          </div>
          <h2 className="font-serif" style={{
            fontSize: 37, fontWeight: 700, color: '#0f172a',
            lineHeight: 1.3, marginBottom: 12,
          }}>
            戦争の構造パターン
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, maxWidth: 720 }}>
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
            fontSize: 12, letterSpacing: '0.2em', color: '#fbbf24',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
          }}>
            🗺️ FULL EXPLORER
          </div>
          <h2 className="font-serif" style={{
            fontSize: 37, fontWeight: 700, lineHeight: 1.3, marginBottom: 16,
          }}>
            すべての戦争を時系列・地図で探索する
          </h2>
          <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 28 }}>
            年表 × 世界地図 × 詳細パネルが連動する完全エクスプローラ。
            <br />
            BC1457〜2025の<strong style={{ color: '#fbbf24' }}>167戦争</strong>を時系列で俯瞰し、地図で位置を確認し、各戦争の構造分析・教訓・市民視点を深掘り。
          </p>
          <Link href="/explore" style={{
            display: 'inline-block',
            padding: '14px 32px', borderRadius: 4,
            background: '#fbbf24', color: '#0f172a',
            fontWeight: 700, fontSize: 16, letterSpacing: '0.05em',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>
            エクスプローラを開く →
          </Link>
        </div>
      </section>

    </div>
  );
}
