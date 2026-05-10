'use client';

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { RELIGION_THEMES } from '@/lib/religion-themes';
import { WARS } from '@/lib/wars';

export default function ReligionPage() {
  const params = useParams();
  const religionId = params.religionId as string;
  const theme = RELIGION_THEMES.find(t => t.id === religionId);

  if (!theme) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>テーマが見つかりません</h1>
          <Link href="/" style={{ color: '#fbbf24', fontSize: 14 }}>← ホームへ</Link>
        </div>
      </div>
    );
  }

  const relatedWars = theme.keyWarIds
    .map(id => WARS.find(w => w.id === id))
    .filter((w): w is NonNullable<typeof w> => w !== undefined)
    .sort((a, b) => a.year - b.year);

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid rgba(248,250,252,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>War Chronicle</span>
          </Link>
          <Link href="/#religions" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 4 }}>
            ← 宗教一覧
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section style={{ background: `linear-gradient(135deg, #0f172a 0%, ${theme.accent}40 100%)`, color: '#f8fafc', padding: '60px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{theme.emoji}</div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
            宗教から歴史を読む
          </div>
          <h1 className="font-serif" style={{ fontSize: 44, fontWeight: 700, marginBottom: 12, letterSpacing: '0.02em' }}>
            {theme.name}
          </h1>
          <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 20, fontWeight: 600 }}>
            {theme.englishName} ／ {theme.period}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: '#e2e8f0', fontStyle: 'italic', maxWidth: 800 }}>
            {theme.shortThesis}
          </p>
        </div>
      </section>

      {/* 起源 */}
      <section style={{ padding: '60px 32px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            起源・背景
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            この宗教はどう生まれたか
          </h2>
          <div style={{ background: 'white', border: `1px solid ${theme.accent}30`, borderLeft: `4px solid ${theme.accent}`, borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.85, color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: theme.origin }} />
        </div>

        {/* 教義の核 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            教義の核
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            何を信じる宗教か
          </h2>
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(15,23,42,0.08)', padding: 20, fontSize: 13, lineHeight: 1.85, color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: theme.coreBeliefs }} />
        </div>

        {/* キー概念 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
            重要概念
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {theme.keyConcepts.map((c) => (
              <span key={c} style={{ padding: '6px 12px', borderRadius: 6, background: `${theme.accent}15`, border: `1px solid ${theme.accent}30`, color: theme.accent, fontSize: 12, fontWeight: 600 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 関連戦争 */}
      <section style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)', padding: '60px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            この宗教を貫く戦争
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
            {relatedWars.length}本の戦争で読み解く
          </h2>

          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: theme.accent, opacity: 0.4 }} />
            {relatedWars.map((war) => (
              <Link key={war.id} href={`/explore?war=${war.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', marginBottom: 16, background: 'white', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 8, padding: 16, transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = theme.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)'; }}>
                  <div style={{ position: 'absolute', left: -28, top: 18, width: 12, height: 12, borderRadius: '50%', background: theme.accent, border: '3px solid white', boxShadow: '0 0 0 1px ' + theme.accent }} />
                  <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, marginBottom: 4 }}>
                    {war.year < 0 ? `紀元前${-war.year}年` : `${war.year}年`}
                    {war.endYear !== war.year && ` – ${war.endYear < 0 ? `紀元前${-war.endYear}年` : `${war.endYear}年`}`}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{war.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{war.theater}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* この宗教の矛盾 */}
      <section style={{ padding: '60px 32px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#dc2626', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            ⚠️ 内的矛盾
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            この宗教が抱えるパラドックス
          </h2>
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderLeft: '4px solid #dc2626', borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.85, color: '#7f1d1d' }}
            dangerouslySetInnerHTML={{ __html: theme.paradox }} />
        </div>

        {/* 現代の状況 */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            現代の姿
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            今、この宗教は世界をどう動かしているか
          </h2>
          <div style={{ background: 'white', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.85, color: '#334155' }}
            dangerouslySetInnerHTML={{ __html: theme.modernSituation }} />
        </div>

        {/* 注意 */}
        <div style={{ marginTop: 40, padding: 16, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, color: '#64748b', lineHeight: 1.75 }}>
          ⚖️ <strong>編集方針</strong>：宗教を「戦争の原因」と単純化せず、政治・経済・地政学・心理が宗教言語で表現された複合現象として記述しています。信仰を否定するものでも、特定宗派を批判するものでもありません。
        </div>
      </section>

      <footer style={{ background: '#020617', color: '#64748b', padding: '32px', textAlign: 'center', fontSize: 11 }}>
        <Link href="/#religions" style={{ color: theme.accent, textDecoration: 'none', marginRight: 16 }}>他の宗教を見る</Link>
        <Link href="/explore" style={{ color: theme.accent, textDecoration: 'none' }}>全戦争を探索</Link>
      </footer>
    </div>
  );
}
