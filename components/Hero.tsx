'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)',
      color: '#f8fafc',
      overflow: 'hidden',
    }}>
      {/* 背景の地図調テクスチャ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59,130,246,0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 70%, rgba(20,184,166,0.08) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      {/* 横線テクスチャ */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 32px 60px',
      }}>
        {/* タグライン */}
        <div style={{
          fontSize: 11, letterSpacing: '0.2em',
          color: '#94a3b8', textTransform: 'uppercase',
          marginBottom: 20, fontWeight: 600,
        }}>
          War Chronicle ／ 多角的戦争史データベース
        </div>

        {/* メインメッセージ — テーゼ */}
        <h1 className="font-serif" style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          lineHeight: 1.25,
          fontWeight: 700,
          letterSpacing: '0.02em',
          marginBottom: 12,
          color: '#f8fafc',
        }}>
          戦争は突然起きない。<br />
          人類は<span style={{ color: '#fbbf24' }}>似た条件</span>で、<br />
          何度も衝突してきた。
        </h1>

        <p style={{
          fontSize: 14, lineHeight: 1.85, color: '#cbd5e1',
          maxWidth: 640, marginTop: 24, marginBottom: 36,
        }}>
          100以上の戦争を、<strong style={{ color: '#fbbf24' }}>時系列・地理・因果・構造</strong>で横断する。
          <br />
          過去のパターンから、現代の危機を読み解き、<strong style={{ color: '#fbbf24' }}>戦争を防ぐ示唆</strong>を得るための知的教養プラットフォーム。
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
          <Link href="#learning-paths" style={{
            padding: '12px 28px', borderRadius: 4,
            background: '#fbbf24', color: '#0f172a',
            fontWeight: 700, fontSize: 13, letterSpacing: '0.05em',
            textDecoration: 'none', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            🎓 歴史から学ぶ
          </Link>
          <Link href="#modern-themes" style={{
            padding: '12px 28px', borderRadius: 4,
            background: 'transparent', color: '#f8fafc',
            border: '1px solid rgba(248,250,252,0.3)',
            fontWeight: 600, fontSize: 13, letterSpacing: '0.05em',
            textDecoration: 'none', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            🌐 現代を読み解く
          </Link>
          <Link href="/explore" style={{
            padding: '12px 28px', borderRadius: 4,
            background: 'transparent', color: '#94a3b8',
            border: '1px solid rgba(148,163,184,0.3)',
            fontWeight: 600, fontSize: 13, letterSpacing: '0.05em',
            textDecoration: 'none', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            🗺️ すべての戦争を探索
          </Link>
        </div>

        {/* キーマトリクス（思想を補強する小さな数字） */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          paddingTop: 32,
          borderTop: '1px solid rgba(148,163,184,0.15)',
        }}>
          {[
            { num: '100+', label: '戦争データ', sub: '1700-2025' },
            { num: '5軸', label: '構造分析', sub: '共通点・普遍性・現代教訓・防止可能性・再現性' },
            { num: '16', label: '戦争パターン', sub: 'ナショナリズム・経済危機・同盟暴走 等' },
            { num: '4', label: '現代テーマ', sub: 'なぜ◯◯？を歴史で解く' },
          ].map((m) => (
            <div key={m.label}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fbbf24', lineHeight: 1, marginBottom: 4, fontFamily: 'serif' }}>
                {m.num}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f8fafc', marginBottom: 2, letterSpacing: '0.05em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
