import type { Metadata } from 'next';
import Link from 'next/link';
import { MYTHS } from '@/lib/myths';
import { ERA_CONFIG } from '@/lib/wars';
import { WARS_CHRONO } from '@/lib/war-data';
import { formatPeriod } from '@/lib/text';
import { MythCard } from '@/components/war/sections';
import type { EraId } from '@/lib/types';

export const metadata: Metadata = {
  title: '通説と史実',
  description: '「元寇は神風で勝った」のように、戦争には後からつくられた物語が史実のように語られるものがあります。広く知られた説と、研究でわかっていることを並べて確かめます。',
};

const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];

export default function MythsPage({ searchParams }: { searchParams: { era?: string } }) {
  const era = ERA_ORDER.includes(searchParams.era as EraId) ? (searchParams.era as EraId) : undefined;
  const wars = WARS_CHRONO.filter((w) => MYTHS[w.id]?.length);
  const total = wars.reduce((n, w) => n + MYTHS[w.id].length, 0);
  const shown = era ? wars.filter((w) => w.era === era) : wars;
  const counts = Object.fromEntries(ERA_ORDER.map((e) => [e, wars.filter((w) => w.era === e).reduce((n, w) => n + MYTHS[w.id].length, 0)]));

  return (
    <main>
      <section className="page-hero">
        <div className="container-read">
          <div className="eyebrow">Myths &amp; Facts</div>
          <h1>通説と史実</h1>
          <p className="lead">
            「元寇は神風が吹いたから勝てた」——戦争には、後の時代の都合でつくられた物語が、いつのまにか史実のように語られているものがあります。
            ここでは広く知られた説と、研究でわかっていることを並べます。現在{wars.length}の戦争について{total}件。
          </p>
        </div>
      </section>

      <div className="container-read myths-body">
        <div className="callout callout--quiet">
          <p>
            <strong>このページの書き方：</strong>史実の側は、現在の歴史研究で広く受け入れられている理解にもとづいて書いています。
            研究者のあいだで見解が分かれている点は「議論が続いている点あり」と明記し、断定しません。
            「通説」の側は、教科書・小説・映画・政治的な語りなどで広まったイメージを要約したものです。
          </p>
        </div>

        <div className="filters__row" style={{ margin: '20px 0 8px' }}>
          <Link href="/myths" className={`chip${!era ? ' is-active' : ''}`}>すべて<span className="count">{total}</span></Link>
          {ERA_ORDER.filter((e) => counts[e] > 0).map((e) => (
            <Link key={e} href={`/myths?era=${e}`} className={`chip${era === e ? ' is-active' : ''}`}>
              {ERA_CONFIG[e].label}<span className="count">{counts[e]}</span>
            </Link>
          ))}
        </div>

        {shown.map((w) => (
          <section key={w.id} className="myths-war">
            <h2 className="myths-war__title">
              <Link href={`/wars/${w.id}#myths`}>{w.name}</Link>
              <span>{formatPeriod(w.year, w.endYear, w.ongoing)}</span>
            </h2>
            <div className="myth-list">
              {MYTHS[w.id].map((m, i) => <MythCard key={i} m={m} />)}
            </div>
          </section>
        ))}
        {shown.length === 0 && <p className="muted" style={{ padding: '24px 0' }}>この時代の項目は準備中です。</p>}
      </div>
    </main>
  );
}
