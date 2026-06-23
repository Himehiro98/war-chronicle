'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GRAND_NARRATIVE } from '@/lib/grand-narrative';
import { WARS } from '@/lib/wars';

const formatYear = (y: number) => (y < 0 ? `BC${-y}` : `${y}`);

/** war ID → { name, year, endYear } を引く */
const WAR_LOOKUP: Record<string, { name: string; year: number; endYear: number }> = (() => {
  const m: Record<string, { name: string; year: number; endYear: number }> = {};
  for (const w of WARS) m[w.id] = { name: w.name, year: w.year, endYear: w.endYear };
  return m;
})();

export default function ChroniclePage() {
  const [activeAct, setActiveAct] = useState<string>(GRAND_NARRATIVE[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // スクロールに応じて現在の幕をハイライト
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-act-id');
            if (id) setActiveAct(id);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    const els = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToAct = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>

      {/* ───── ヘッダー ───── */}
      <header style={{
        background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(248,250,252,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <Link href="/" style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'none', padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(148,163,184,0.2)' }}>
              ← ホーム
            </Link>
            <span className="font-serif" style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>War Chronicle</span>
            <span style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.12em' }}>通史モード</span>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'パターン進化', href: '/patterns', emoji: '🧬' },
              { label: '因果の大河', href: '/chains', emoji: '🌊' },
              { label: '探索', href: '/explore', emoji: '🗺️' },
            ].map(({ label, href, emoji }) => (
              <Link key={label} href={href} style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 4,
                color: '#94a3b8', textDecoration: 'none', border: '1px solid rgba(148,163,184,0.2)',
              }}>{emoji} {label}</Link>
            ))}
          </nav>
        </div>
        {/* 幕ジャンプナビ */}
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px 8px',
          display: 'flex', gap: 4, flexWrap: 'wrap',
        }}>
          {GRAND_NARRATIVE.map((act) => {
            const active = act.id === activeAct;
            return (
              <button key={act.id} onClick={() => scrollToAct(act.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 11px', borderRadius: 20, fontSize: 10, cursor: 'pointer',
                  fontWeight: active ? 700 : 500, letterSpacing: '0.02em',
                  background: active ? act.accent : 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  border: `1px solid ${active ? act.accent : 'rgba(148,163,184,0.25)'}`,
                  transition: 'all 0.2s',
                }}>
                <span style={{ fontWeight: 700 }}>{act.roman}</span>
                {act.era}
              </button>
            );
          })}
        </div>
      </header>

      {/* ───── イントロ ───── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', marginBottom: 18 }}>
          The Grand Narrative
        </div>
        <h1 className="font-serif" style={{ fontSize: 'clamp(30px, 5vw, 52px)', lineHeight: 1.3, fontWeight: 700, marginBottom: 20 }}>
          人類戦争の<br />大きな物語
        </h1>
        <p style={{ fontSize: 14, lineHeight: 2, color: '#cbd5e1', maxWidth: 600, margin: '0 auto' }}>
          これは176の独立した「点」ではない。<br />
          BC1457から現在まで、戦争は<strong style={{ color: '#fbbf24' }}>形を変えながら一本に繋がっている</strong>。
          帝国の威信から、神の意志へ。国家の利益から、国民の総動員へ——
          6つの幕を通れば、なぜ戦争の「かたち」が変わってきたのか、その背骨が見えるばい。
        </p>
        <div style={{ marginTop: 32, fontSize: 22, color: '#475569', animation: 'cn-bounce 2s infinite' }}>↓</div>
      </section>

      {/* ───── 各幕 ───── */}
      {GRAND_NARRATIVE.map((act, actIdx) => (
        <section
          key={act.id}
          data-act-id={act.id}
          ref={(el) => { sectionRefs.current[act.id] = el; }}
          style={{
            position: 'relative',
            borderTop: `1px solid rgba(248,250,252,0.06)`,
            background: actIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
            scrollMarginTop: 96,
          }}
        >
          {/* 左の時代帯 */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
            background: `linear-gradient(180deg, ${act.accent}, ${act.accent}33)`,
          }} />

          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px 56px 32px', position: 'relative' }}>

            {/* 巨大なローマ数字（背景装飾） */}
            <div aria-hidden style={{
              position: 'absolute', top: 28, right: 16,
              fontSize: 'clamp(80px, 16vw, 180px)', fontWeight: 800,
              color: act.accent, opacity: 0.08, lineHeight: 1, fontFamily: 'serif',
              pointerEvents: 'none', userSelect: 'none',
            }}>
              {act.roman}
            </div>

            {/* ヘッダー */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 26 }}>{act.emoji}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  color: act.accent, padding: '3px 10px', borderRadius: 4,
                  background: `${act.accent}1f`, border: `1px solid ${act.accent}55`,
                }}>
                  第{act.roman}幕 ／ {act.era}
                </span>
                <span style={{ fontSize: 11, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{act.period}</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 700, lineHeight: 1.35, color: '#f8fafc' }}>
                {act.thesis}
              </h2>
            </div>

            {/* 転換点バッジ */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '12px 16px', borderRadius: 8, marginBottom: 18,
              background: `${act.accent}12`, border: `1px solid ${act.accent}33`,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⟳</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: act.accent, marginBottom: 3 }}>
                  前の時代から、何が変わったか
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7, color: '#e2e8f0' }}>{act.transition}</div>
              </div>
            </div>

            {/* リード文 */}
            <p style={{ fontSize: 14, lineHeight: 2, color: '#cbd5e1', marginBottom: 18, maxWidth: 720 }}>
              {act.lead}
            </p>

            {/* この時代を動かした論理（タグ） */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>この時代を動かした論理：</span>
              {act.logics.map((tag) => (
                <Link key={tag} href={`/patterns?tag=${encodeURIComponent(tag)}`} style={{
                  fontSize: 10, padding: '2px 9px', borderRadius: 12, textDecoration: 'none',
                  background: 'rgba(248,250,252,0.06)', color: '#cbd5e1',
                  border: '1px solid rgba(248,250,252,0.12)',
                }}>
                  {tag}
                </Link>
              ))}
            </div>

            {/* 代表戦争カード */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {act.keyWars.map((kw, i) => {
                const info = WAR_LOOKUP[kw.id];
                if (!info) return null;
                return (
                  <Link key={kw.id} href={`/explore?war=${kw.id}`}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '14px 16px', borderRadius: 10, textDecoration: 'none',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(248,250,252,0.08)',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${act.accent}1a`;
                      e.currentTarget.style.borderColor = `${act.accent}66`;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(248,250,252,0.08)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                    {/* 番号 */}
                    <div style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                      background: act.accent, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, marginTop: 2,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className="font-serif" style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>{info.name}</span>
                        <span style={{ fontSize: 10, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                          {formatYear(info.year)}–{formatYear(info.endYear)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, color: '#cbd5e1' }}>{kw.why}</div>
                    </div>
                    <span style={{ flexShrink: 0, color: act.accent, fontSize: 16, alignSelf: 'center' }}>→</span>
                  </Link>
                );
              })}
            </div>

            {/* throughline（次の幕への接続） */}
            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px dashed rgba(248,250,252,0.12)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🧵</span>
                <p style={{ fontSize: 13, lineHeight: 1.85, color: '#e2e8f0', fontStyle: 'italic', margin: 0 }}>
                  {act.throughline}
                </p>
              </div>
              {actIdx < GRAND_NARRATIVE.length - 1 && (
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <button onClick={() => scrollToAct(GRAND_NARRATIVE[actIdx + 1].id)}
                    style={{
                      fontSize: 11, color: '#94a3b8', background: 'transparent',
                      border: 'none', cursor: 'pointer', letterSpacing: '0.05em',
                    }}>
                    第{GRAND_NARRATIVE[actIdx + 1].roman}幕「{GRAND_NARRATIVE[actIdx + 1].era}」へ ↓
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ───── 末尾CTA ───── */}
      <section style={{
        borderTop: '1px solid rgba(248,250,252,0.08)',
        background: 'linear-gradient(180deg, transparent, rgba(251,191,36,0.04))',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🐾</div>
          <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            背骨は、つかめたかな？
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: '#cbd5e1', marginBottom: 28 }}>
            6つの幕を通って、戦争が「点」じゃなく「一本の物語」だと分かったはずだワン。
            ここから先は、気になった戦争を深く掘ったり、同じ構造が繰り返す「教訓」を確かめたりして、
            自分の「次の戦争を読む目」を鍛えるばい。
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/explore" style={{
              padding: '11px 22px', borderRadius: 6, background: '#fbbf24', color: '#0f172a',
              fontWeight: 700, fontSize: 12, textDecoration: 'none',
            }}>
              🗺️ 戦争を探索する
            </Link>
            <Link href="/lessons" style={{
              padding: '11px 22px', borderRadius: 6, background: 'transparent', color: '#f8fafc',
              fontWeight: 600, fontSize: 12, textDecoration: 'none', border: '1px solid rgba(248,250,252,0.3)',
            }}>
              💡 教訓を横断する
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes cn-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
