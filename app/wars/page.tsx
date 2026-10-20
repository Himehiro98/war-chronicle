import type { Metadata } from 'next';
import Link from 'next/link';
import { ERA_CONFIG, REGIONS } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';
import { WARS_CHRONO } from '@/lib/war-data';
import { firstSentence, formatPeriod } from '@/lib/text';
import { WAR_COUNT, YEAR_RANGE_LABEL } from '@/lib/site';
import type { EraId, War, WarTag } from '@/lib/types';

export const metadata: Metadata = {
  title: '戦争一覧',
  description: `${YEAR_RANGE_LABEL}の${WAR_COUNT}の戦争を、時代・地域・構造パターンで絞り込んで一覧できます。`,
};

const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];
const TYPE_LABEL: Record<string, string> = { war: '戦争', revolution: '革命・内戦', colonial: '植民地戦争' };

type SP = { era?: string; region?: string; tag?: string; type?: string; ongoing?: string };

function href(cur: SP, patch: Partial<SP>) {
  const next = { ...cur, ...patch };
  const qs = new URLSearchParams();
  (Object.keys(next) as (keyof SP)[]).forEach((k) => { if (next[k]) qs.set(k, next[k]!); });
  const s = qs.toString();
  return s ? `/wars?${s}` : '/wars';
}

export default function WarsIndexPage({ searchParams }: { searchParams: SP }) {
  const sp: SP = {
    era: ERA_ORDER.includes(searchParams.era as EraId) ? searchParams.era : undefined,
    region: searchParams.region && /^[0-3]$/.test(searchParams.region) ? searchParams.region : undefined,
    tag: searchParams.tag || undefined,
    type: searchParams.type && TYPE_LABEL[searchParams.type] ? searchParams.type : undefined,
    ongoing: searchParams.ongoing === '1' ? '1' : undefined,
  };

  const tagCounts = new Map<WarTag, number>();
  for (const w of WARS_CHRONO) for (const t of w.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]);

  const list = WARS_CHRONO.filter((w) =>
    (!sp.era || w.era === sp.era) &&
    (!sp.region || w.region === Number(sp.region)) &&
    (!sp.tag || w.tags?.includes(sp.tag as WarTag)) &&
    (!sp.type || w.type === sp.type) &&
    (!sp.ongoing || w.ongoing),
  );
  const groups = ERA_ORDER.map((era) => ({ era, wars: list.filter((w) => w.era === era) })).filter((g) => g.wars.length);
  const filtered = Object.values(sp).some(Boolean);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">All Wars</div>
          <h1>戦争一覧</h1>
          <p className="lead">
            {YEAR_RANGE_LABEL}の{WAR_COUNT}の戦争・革命・紛争を年代順に並べています。時代・地域・構造パターンで絞り込めます。
            地図で見たいときは<Link href="/explore" style={{ color: 'var(--highlight)' }}>年表・地図</Link>へ。
          </p>
        </div>
      </section>

      <div className="container wars-index">
        <div className="filters" aria-label="絞り込み">
          <div className="filters__row">
            <span className="filters__label">時代</span>
            <Link href={href(sp, { era: undefined })} className={`chip${!sp.era ? ' is-active' : ''}`}>すべて</Link>
            {ERA_ORDER.map((e) => (
              <Link key={e} href={href(sp, { era: e })} className={`chip${sp.era === e ? ' is-active' : ''}`}>{ERA_CONFIG[e].label}</Link>
            ))}
          </div>
          <div className="filters__row">
            <span className="filters__label">地域</span>
            <Link href={href(sp, { region: undefined })} className={`chip${!sp.region ? ' is-active' : ''}`}>すべて</Link>
            {REGIONS.map((r, i) => (
              <Link key={r} href={href(sp, { region: String(i) })} className={`chip${sp.region === String(i) ? ' is-active' : ''}`}>{r}</Link>
            ))}
            <span className="filters__sep" />
            <span className="filters__label">種類</span>
            <Link href={href(sp, { type: undefined })} className={`chip${!sp.type ? ' is-active' : ''}`}>すべて</Link>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <Link key={k} href={href(sp, { type: k })} className={`chip${sp.type === k ? ' is-active' : ''}`}>{v}</Link>
            ))}
            <Link href={href(sp, { ongoing: sp.ongoing ? undefined : '1' })} className={`chip${sp.ongoing ? ' is-active' : ''}`}>継続中のみ</Link>
          </div>
          <details className="filters__tags" open={!!sp.tag}>
            <summary>構造パターンで絞り込む{sp.tag ? `（${sp.tag}）` : ''}</summary>
            <div className="filters__row">
              <Link href={href(sp, { tag: undefined })} className={`chip${!sp.tag ? ' is-active' : ''}`}>指定なし</Link>
              {tags.map(([t, n]) => (
                <Link key={t} href={href(sp, { tag: t })} className={`chip${sp.tag === t ? ' is-active' : ''}`}>{t}<span className="count">{n}</span></Link>
              ))}
            </div>
          </details>
          <div className="filters__result">
            {list.length}件{filtered && <> ・ <Link href="/wars">条件をクリア</Link></>}
          </div>
        </div>

        {groups.map((g) => (
          <section key={g.era} className="wars-group">
            <h2 className="wars-group__title">{ERA_CONFIG[g.era].label}<span>{g.wars.length}件</span></h2>
            <ul className="wars-list">
              {g.wars.map((w) => <WarRow key={w.id} war={w} />)}
            </ul>
          </section>
        ))}
        {list.length === 0 && <p className="muted" style={{ padding: '32px 0' }}>条件に合う戦争はありません。</p>}
      </div>
    </main>
  );
}

function WarRow({ war }: { war: War }) {
  const summary = firstSentence(WAR_CONTENT[war.id]?.digest.background, 110);
  return (
    <li>
      <Link href={`/wars/${war.id}`} className="wars-row">
        <div className="wars-row__period">{formatPeriod(war.year, war.endYear, war.ongoing)}</div>
        <div className="wars-row__main">
          <div className="wars-row__name">
            {war.name}
            {war.ongoing && <span className="wars-row__badge">継続中</span>}
          </div>
          <div className="wars-row__meta">{REGIONS[war.region]}・{TYPE_LABEL[war.type]}・{war.theater}</div>
          {summary && <p className="wars-row__summary">{summary}</p>}
        </div>
      </Link>
    </li>
  );
}
