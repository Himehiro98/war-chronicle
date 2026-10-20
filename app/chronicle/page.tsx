import type { Metadata } from 'next';
import Link from 'next/link';
import { GRAND_NARRATIVE } from '@/lib/grand-narrative';
import { WAR_BY_ID } from '@/lib/war-data';
import { formatPeriod } from '@/lib/text';
import { WAR_COUNT, YEAR_RANGE_LABEL } from '@/lib/site';
import ActNav from '@/components/ActNav';

export const metadata: Metadata = {
  title: '通史：人類戦争の大きな物語',
  description: '古代から現代まで、戦争の「かたち」はどう変わってきたのか。6つの時代（幕）を順にたどり、戦争史の背骨をつかむ通史。',
};

export default function ChroniclePage() {
  const navItems = GRAND_NARRATIVE.map((a) => ({ id: a.id, short: `${a.roman} ${a.era}`, full: `第${a.roman}幕 ${a.era}：${a.thesis}` }));

  return (
    <main>
      <section className="page-hero">
        <div className="container-read" style={{ textAlign: 'center' }}>
          <div className="eyebrow">The Grand Narrative</div>
          <h1>人類戦争の大きな物語</h1>
          <p className="lead" style={{ margin: '0 auto' }}>
            このサイトにある{WAR_COUNT}の戦争は、ばらばらの「点」ではありません。{YEAR_RANGE_LABEL}まで、戦争は形を変えながら一本につながっています。
            帝国の威信から神の意志へ、国家の利益から国民の総動員へ——6つの幕をたどると、戦争の「かたち」がなぜ変わってきたのかが見えてきます。
          </p>
          <p className="chronicle-time">読了の目安：約15分</p>
        </div>
      </section>

      <ActNav items={navItems} label="幕の目次" />

      {GRAND_NARRATIVE.map((act, i) => {
        const next = GRAND_NARRATIVE[i + 1];
        return (
          <section key={act.id} id={act.id} className="act" style={{ '--c': act.accent } as React.CSSProperties}>
            <div className="container-read act__inner">
              <div className="act__roman" aria-hidden>{act.roman}</div>
              <div className="act__label">第{act.roman}幕　{act.era}<span>{act.period}</span></div>
              <h2 className="act__thesis">{act.thesis}</h2>

              <div className="act__transition">
                <div className="act__transition-label">前の時代から何が変わったか</div>
                <p>{act.transition}</p>
              </div>

              <p className="act__lead">{act.lead}</p>

              <div className="act__logics">
                <span>この時代を動かした論理</span>
                {act.logics.map((t) => (
                  <Link key={t} href={`/patterns?tag=${encodeURIComponent(t)}`} className="tag">{t}</Link>
                ))}
              </div>

              <h3 className="act__wars-title">この幕を象徴する戦争</h3>
              <ol className="act__wars">
                {act.keyWars.map((kw) => {
                  const w = WAR_BY_ID[kw.id];
                  if (!w) return null;
                  return (
                    <li key={kw.id}>
                      <Link href={`/wars/${w.id}`} className="act-war">
                        <span className="act-war__name">{w.name}</span>
                        <span className="act-war__year">{formatPeriod(w.year, w.endYear, w.ongoing)}</span>
                        <span className="act-war__why">{kw.why}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>

              <p className="act__throughline">{act.throughline}</p>
              {next && (
                <a href={`#${next.id}`} className="act__next">第{next.roman}幕「{next.era}」へ進む ↓</a>
              )}
            </div>
          </section>
        );
      })}

      <section className="section chronicle-end">
        <div className="container-read" style={{ textAlign: 'center' }}>
          <h2 className="font-serif" style={{ fontSize: 26, marginBottom: 12 }}>背骨をつかんだら、次は</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            気になった戦争を深く読む、同じ構造がくり返される様子を比べる、教訓を横断する——好きな方向へ進んでください。
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/explore" className="btn btn--accent">年表と地図で探す</Link>
            <Link href="/patterns" className="btn btn--ghost">パターン進化を見る</Link>
            <Link href="/lessons" className="btn btn--ghost">教訓を横断する</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
