import type { Metadata } from 'next';
import Link from 'next/link';
import { TAGS } from '@/lib/tags';
import { ERA_CONFIG } from '@/lib/wars';
import { WARS_CHRONO } from '@/lib/war-data';
import { formatYear } from '@/lib/text';
import type { EraId, War, WarTag } from '@/lib/types';

export const metadata: Metadata = {
  title: 'パターン進化：同じ過ちの履歴書',
  description: 'ナショナリズム、安全保障ジレンマ、権力の空白——戦争を動かす構造パターンが、古代から現代まで何度現れてきたかを時間軸で確かめる。',
};

const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];
const ERA_SHORT: Record<EraId, string> = {
  prehistoric: '先史', ancient: '古代', medieval: '中世', renaissance: '近世前期',
  'early-modern': '近世・近代', '20th-century': '20世紀', contemporary: '21世紀',
};

export default function PatternsPage({ searchParams }: { searchParams: { tag?: string } }) {
  const tagWars: Partial<Record<WarTag, War[]>> = {};
  for (const w of WARS_CHRONO) for (const t of w.tags ?? []) (tagWars[t] ??= []).push(w);
  const ordered = (Object.keys(tagWars) as WarTag[]).sort((a, b) => tagWars[b]!.length - tagWars[a]!.length);

  const selected: WarTag = searchParams.tag && tagWars[searchParams.tag as WarTag] ? (searchParams.tag as WarTag) : ordered[0];
  const wars = tagWars[selected] ?? [];
  const meta = TAGS[selected];

  const counts = ERA_ORDER.map((e) => ({ era: e, n: wars.filter((w) => w.era === e).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));
  const first = wars[0];
  const last = wars[wars.length - 1];
  const span = first && last ? last.year - first.year : 0;
  const eraCount = counts.filter((c) => c.n > 0).length;

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Pattern Evolution</div>
          <h1>同じ過ちの履歴書</h1>
          <p className="lead">
            「人類は似た条件で何度も衝突してきた」——それは標語ではなく、データで確かめられます。
            構造パターンを選ぶと、それが古代から現代までどの戦争に現れたかが時間軸に並びます。
          </p>
        </div>
      </section>

      <div className="container patterns-body">
        <nav className="patterns-tags" aria-label="構造パターンを選ぶ">
          {ordered.map((t) => (
            <Link
              key={t}
              href={`/patterns?tag=${encodeURIComponent(t)}`}
              scroll={false}
              className={`chip${t === selected ? ' is-active' : ''}`}
              aria-current={t === selected ? 'page' : undefined}
            >
              <span aria-hidden>{TAGS[t]?.emoji}</span>{t}<span className="count">{tagWars[t]!.length}</span>
            </Link>
          ))}
        </nav>

        {meta && (
          <section className="card pattern-panel" style={{ '--c': meta.accent } as React.CSSProperties}>
            <h2 className="pattern-panel__title"><span aria-hidden>{meta.emoji}</span>{selected}</h2>
            <p className="pattern-panel__desc">{meta.shortDesc}</p>

            <dl className="pattern-stats">
              <div><dt>出現した戦争</dt><dd>{wars.length}件</dd></div>
              <div><dt>最初の例</dt><dd>{first ? `${formatYear(first.year)}年` : '—'}</dd></div>
              <div><dt>最新の例</dt><dd>{last ? `${formatYear(last.year)}年` : '—'}</dd></div>
              <div><dt>期間</dt><dd>{span.toLocaleString()}年</dd></div>
              <div><dt>現れた時代</dt><dd>{eraCount} / {ERA_ORDER.length}</dd></div>
            </dl>

            <div className="pattern-hist" aria-label="時代ごとの件数">
              {counts.map((c) => (
                <div key={c.era} className="pattern-hist__col">
                  <span className="pattern-hist__n">{c.n}</span>
                  <span className="pattern-hist__bar" style={{ height: `${Math.max((c.n / max) * 64, c.n ? 6 : 2)}px`, opacity: c.n ? 1 : 0.25 }} />
                  <span className="pattern-hist__label">{ERA_SHORT[c.era]}</span>
                </div>
              ))}
            </div>

            <div className="pattern-facts">
              <div><h3>どう作用するか</h3><p>{meta.mechanism}</p></div>
              <div><h3>代表的な事例</h3><p>{meta.classicCase}</p></div>
              <div className="is-warn"><h3>現代で注意が必要な例</h3><p>{meta.modernRisk}</p></div>
            </div>
          </section>
        )}

        <h2 className="panel-subhead">「{selected}」が現れた{wars.length}の戦争</h2>
        <ol className="pattern-timeline">
          {wars.map((w, i) => {
            const newEra = i === 0 || wars[i - 1].era !== w.era;
            return (
              <li key={w.id}>
                {newEra && <div className="pattern-timeline__era">{ERA_CONFIG[w.era].label}</div>}
                <Link href={`/wars/${w.id}`} className="pattern-timeline__row">
                  <span className="pattern-timeline__year">{formatYear(w.year)}</span>
                  <span className="pattern-timeline__name">{w.name}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <aside className="wanta-note" style={{ marginTop: 40 }}>
          <img src="/wanta.png" alt="" width={56} height={56} className="wanta-note__img" />
          <div className="wanta-note__bubble">
            <div className="wanta-note__name">わんたのひとこと</div>
            <p>
              「{selected}」は{first ? formatYear(first.year) : ''}年から{last ? formatYear(last.year) : ''}年まで、{span.toLocaleString()}年のあいだに{wars.length}回も現れているワン。
              同じ条件が揃うと、人は時代や文化を越えて同じ道をたどりがちなんだ。「この兆しは危ない」と気づく目が、戦争を防ぐ第一歩だワン。
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Link href="/diagnose" className="btn btn--accent btn--sm">今の出来事をAI診断する</Link>
              <Link href="/lessons" className="btn btn--ghost btn--sm">教訓を横断する</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
