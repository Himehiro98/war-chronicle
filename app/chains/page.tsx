'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { WARS } from '@/lib/wars';
import { CAUSAL_CHAINS } from '@/lib/causal-chains';

const formatYear = (y: number) => (y < 0 ? `BC${-y}` : `${y}`);

interface WarInfo { id: string; name: string; year: number; endYear: number; causes: string[]; influences: string[]; }

const WAR_MAP: Record<string, WarInfo> = (() => {
  const m: Record<string, WarInfo> = {};
  for (const w of WARS) m[w.id] = { id: w.id, name: w.name, year: w.year, endYear: w.endYear, causes: w.causes ?? [], influences: w.influences ?? [] };
  return m;
})();

export default function ChainsPage() {
  const [traceId, setTraceId] = useState<string>('world-war-1');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('war');
    if (q && WAR_MAP[q]) setTraceId(q);
  }, []);

  // 因果ネットワークを持つ戦争のみ（トレーサーの選択肢）— 年代順
  const connectedWars = useMemo(() => {
    return Object.values(WAR_MAP)
      .filter((w) => w.causes.length > 0 || w.influences.length > 0)
      .sort((a, b) => a.year - b.year);
  }, []);

  const trace = WAR_MAP[traceId];

  // 上流（原因）を2階層辿る
  const upstream = useMemo(() => {
    if (!trace) return [] as { level: number; war: WarInfo }[];
    const out: { level: number; war: WarInfo }[] = [];
    const seen = new Set<string>([trace.id]);
    let frontier = trace.causes.filter((c) => WAR_MAP[c]);
    for (let level = 1; level <= 2 && frontier.length; level++) {
      const next: string[] = [];
      for (const id of frontier) {
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ level, war: WAR_MAP[id] });
        next.push(...WAR_MAP[id].causes.filter((c) => WAR_MAP[c] && !seen.has(c)));
      }
      frontier = next;
    }
    return out.sort((a, b) => a.war.year - b.war.year);
  }, [trace]);

  // 下流（影響）を2階層辿る
  const downstream = useMemo(() => {
    if (!trace) return [] as { level: number; war: WarInfo }[];
    const out: { level: number; war: WarInfo }[] = [];
    const seen = new Set<string>([trace.id]);
    let frontier = trace.influences.filter((c) => WAR_MAP[c]);
    for (let level = 1; level <= 2 && frontier.length; level++) {
      const next: string[] = [];
      for (const id of frontier) {
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ level, war: WAR_MAP[id] });
        next.push(...WAR_MAP[id].influences.filter((c) => WAR_MAP[c] && !seen.has(c)));
      }
      frontier = next;
    }
    return out.sort((a, b) => a.war.year - b.war.year);
  }, [trace]);

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>


      <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 24px' }}>

        {/* タイトル */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.25em', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>Causal Rivers</div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, lineHeight: 1.3, marginBottom: 14 }}>
            因果の大河 — ドミノを辿る
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.95, color: '#cbd5e1', maxWidth: 700 }}>
            戦争は「点」では起きん。<strong style={{ color: '#fbbf24' }}>一つの戦争の結末が、次の戦争の原因になる</strong>。
            ここでは、実在の因果のつながりを「読める一本道」に編み直したばい。ドミノがどう倒れていったかを辿れば、
            今の戦争が<strong style={{ color: '#fbbf24' }}>どこから流れてきた水なのか</strong>が見えてくる。
          </p>
        </div>

        {/* ───── Part A: キュレーション大河 ───── */}
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 16 }}>
          🌊 厳選された4つの大河
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 56 }}>
          {CAUSAL_CHAINS.map((chain) => (
            <div key={chain.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12,
              border: `1px solid ${chain.accent}33`, borderLeft: `4px solid ${chain.accent}`,
              padding: '20px 22px',
            }}>
              {/* 大河ヘッダー */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <span style={{ fontSize: 25 }}>{chain.emoji}</span>
                  <h3 className="font-serif" style={{ fontSize: 23, fontWeight: 700 }}>{chain.title}</h3>
                  <span style={{ fontSize: 11, color: chain.accent, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${chain.accent}1f`, border: `1px solid ${chain.accent}44` }}>
                    {chain.nodes.length}戦争
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', fontStyle: 'italic' }}>{chain.thesis}</p>
              </div>

              {/* 流れ */}
              <div style={{ position: 'relative' }}>
                {chain.nodes.map((node, i) => {
                  const w = WAR_MAP[node.id];
                  if (!w) return null;
                  const isLast = i === chain.nodes.length - 1;
                  return (
                    <div key={node.id}>
                      <Link href={`/wars/${w.id}`}
                        style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', padding: '2px 0' }}
                        onMouseEnter={(e) => { (e.currentTarget.querySelector('[data-nm]') as HTMLElement).style.color = chain.accent; }}
                        onMouseLeave={(e) => { (e.currentTarget.querySelector('[data-nm]') as HTMLElement).style.color = '#f8fafc'; }}>
                        <span style={{
                          flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                          background: chain.accent, color: '#fff', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{i + 1}</span>
                        <span data-nm className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', transition: 'color 0.15s' }}>{w.name}</span>
                        <span style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{formatYear(w.year)}</span>
                      </Link>
                      {!isLast && node.connector && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', margin: '2px 0' }}>
                          <div style={{ width: 26, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <div style={{ width: 2, background: `${chain.accent}55`, minHeight: 22 }} />
                          </div>
                          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '4px 0' }}>
                            <span style={{ fontSize: 14, color: chain.accent, flexShrink: 0 }}>↓</span>
                            <span style={{ fontSize: 14, lineHeight: 1.65, color: '#94a3b8' }}>{node.connector}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ───── Part B: インタラクティブ・トレーサー ───── */}
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8 }}>
          🔎 どの戦争からでも因果を辿る
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: '#cbd5e1', marginBottom: 16 }}>
          戦争を1つ選ぶと、それを<strong style={{ color: '#fbbf24' }}>生んだ原因の流れ（上流）</strong>と、それが
          <strong style={{ color: '#fbbf24' }}>引き起こした影響の流れ（下流）</strong>を2世代まで遡って表示するばい。
        </p>

        {/* 選択 */}
        <select value={traceId} onChange={(e) => setTraceId(e.target.value)}
          style={{
            width: '100%', maxWidth: 420, padding: '9px 12px', borderRadius: 8, fontSize: 16,
            background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.3)',
            marginBottom: 22, cursor: 'pointer',
          }}>
          {connectedWars.map((w) => (
            <option key={w.id} value={w.id}>{w.name}（{formatYear(w.year)}）</option>
          ))}
        </select>

        {trace && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* 上流 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#0ea5e9', marginBottom: 10 }}>
                ▲ この戦争を生んだ原因の流れ（上流）
              </div>
              {upstream.length === 0 ? (
                <div style={{ fontSize: 13, color: '#64748b', paddingLeft: 4 }}>記録された原因戦争はありません（連鎖の源流）。</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {upstream.map(({ level, war }) => (
                    <Link key={war.id} href={`/wars/${war.id}`}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none',
                        paddingLeft: (level - 1) * 22, opacity: level === 1 ? 1 : 0.72,
                      }}>
                      <span style={{ fontSize: 13, color: '#0ea5e9', flexShrink: 0 }}>{level === 1 ? '└' : '└┄'}</span>
                      <span style={{ fontSize: 16, color: '#e2e8f0' }}>{war.name}</span>
                      <span style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{formatYear(war.year)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 中心（選択した戦争） */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0',
              padding: '14px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.16), rgba(251,191,36,0.06))',
              border: '2px solid #fbbf24',
            }}>
              <span style={{ fontSize: 25 }}>🎯</span>
              <div>
                <div className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>{trace.name}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                  {formatYear(trace.year)}–{formatYear(trace.endYear)} ／ 原因{trace.causes.length}・影響{trace.influences.length}
                </div>
              </div>
              <Link href={`/wars/${trace.id}`} style={{
                marginLeft: 'auto', fontSize: 13, fontWeight: 700, padding: '7px 13px',
                borderRadius: 6, background: '#fbbf24', color: '#0f172a', textDecoration: 'none', whiteSpace: 'nowrap',
              }}>📖 詳しく</Link>
            </div>

            {/* 下流 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#f87171', marginBottom: 10 }}>
                ▼ この戦争が引き起こした影響の流れ（下流）
              </div>
              {downstream.length === 0 ? (
                <div style={{ fontSize: 13, color: '#64748b', paddingLeft: 4 }}>記録された影響戦争はありません（連鎖の河口）。</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {downstream.map(({ level, war }) => (
                    <Link key={war.id} href={`/wars/${war.id}`}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none',
                        paddingLeft: (level - 1) * 22, opacity: level === 1 ? 1 : 0.72,
                      }}>
                      <span style={{ fontSize: 13, color: '#f87171', flexShrink: 0 }}>{level === 1 ? '└' : '└┄'}</span>
                      <span style={{ fontSize: 16, color: '#e2e8f0' }}>{war.name}</span>
                      <span style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{formatYear(war.year)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 末尾 */}
        <div style={{ marginTop: 44, padding: '20px 22px', borderRadius: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🐾</span>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: '#e2e8f0', margin: 0 }}>
              戦争は孤立した事件やなくて、<strong style={{ color: '#fbbf24' }}>過去から流れてきて未来へ注ぐ「川」</strong>なんだワン。
              今のニュースの戦争も、上流をたどれば必ず昔の未解決にぶつかる。だけん「この戦争の源流はどこか」を問う癖が、
              次のドミノを止める知恵になるんだばい。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
