import type { Metadata } from 'next';
import Link from 'next/link';
import { WAR_CONTENT } from '@/lib/content';
import { WANTA_COMMENTS } from '@/lib/wanta';
import { ERA_CONFIG } from '@/lib/wars';
import { WARS_CHRONO } from '@/lib/war-data';
import { formatPeriod } from '@/lib/text';
import type { EraId, WantaComments } from '@/lib/types';

export const metadata: Metadata = {
  title: 'わんたの解説',
  description: 'ナビ犬わんたが、各戦争のポイントをひとことで解説。気になった解説から、その戦争のページへ進めます。',
};

type TabKey = keyof WantaComments;
const TABS: { key: TabKey; label: string; anchor: string }[] = [
  { key: 'digest', label: '概要', anchor: 'overview' },
  { key: 'detail', label: '詳しく読む', anchor: 'story' },
  { key: 'perspectives', label: '各国の視点', anchor: 'perspectives' },
  { key: 'structure', label: '構造', anchor: 'structure' },
  { key: 'legacy', label: 'その後', anchor: 'legacy' },
  { key: 'human', label: '市民の視点', anchor: 'people' },
  { key: 'lessons', label: '教訓', anchor: 'lessons' },
  { key: 'exam', label: '論述問題', anchor: 'exam' },
];
const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];
const PER_PAGE = 25;

type SP = { era?: string; tab?: string; q?: string; page?: string };
function href(cur: SP, patch: Partial<SP>) {
  const next = { ...cur, page: undefined, ...patch };
  const qs = new URLSearchParams();
  (Object.keys(next) as (keyof SP)[]).forEach((k) => { if (next[k]) qs.set(k, next[k]!); });
  const s = qs.toString();
  return s ? `/wanta?${s}` : '/wanta';
}

export default function WantaPage({ searchParams }: { searchParams: SP }) {
  const sp: SP = {
    era: ERA_ORDER.includes(searchParams.era as EraId) ? searchParams.era : undefined,
    tab: TABS.some((t) => t.key === searchParams.tab) ? searchParams.tab : undefined,
    q: searchParams.q?.trim() || undefined,
  };
  const page = Math.max(1, Number(searchParams.page) || 1);

  const groups = WARS_CHRONO
    .filter((w) => !sp.era || w.era === sp.era)
    .map((w) => {
      const c = { ...(WAR_CONTENT[w.id]?.wanta ?? {}), ...(WANTA_COMMENTS[w.id] ?? {}) };
      const entries = TABS
        .filter((t) => (!sp.tab || t.key === sp.tab) && c[t.key])
        .map((t) => ({ ...t, text: c[t.key]! }))
        .filter((e) => !sp.q || e.text.includes(sp.q) || w.name.includes(sp.q));
      return { war: w, entries };
    })
    .filter((g) => g.entries.length > 0);

  const totalComments = groups.reduce((n, g) => n + g.entries.length, 0);
  const pages = Math.max(1, Math.ceil(groups.length / PER_PAGE));
  const shown = groups.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main>
      <section className="page-hero wanta-hero">
        <div className="container wanta-hero__inner">
          <img src="/wanta.png" alt="" width={96} height={96} className="wanta-hero__img" />
          <div>
            <div className="eyebrow">Wanta&apos;s Notes</div>
            <h1>わんたの解説</h1>
            <p className="lead">ナビ犬わんたが、各戦争のポイントをひとことで解説するワン。気になった解説から、その戦争のページへ進んでね。</p>
          </div>
        </div>
      </section>

      <div className="container wanta-body">
        <div className="filters">
          <form action="/wanta" method="get" className="filters__row">
            {sp.era && <input type="hidden" name="era" value={sp.era} />}
            {sp.tab && <input type="hidden" name="tab" value={sp.tab} />}
            <input className="input" type="search" name="q" defaultValue={sp.q} placeholder="キーワードで探す" style={{ maxWidth: 360 }} />
            <button type="submit" className="btn btn--ghost btn--sm">探す</button>
          </form>
          <div className="filters__row">
            <span className="filters__label">時代</span>
            <Link href={href(sp, { era: undefined })} className={`chip${!sp.era ? ' is-active' : ''}`}>すべて</Link>
            {ERA_ORDER.map((e) => (
              <Link key={e} href={href(sp, { era: e })} className={`chip${sp.era === e ? ' is-active' : ''}`}>{ERA_CONFIG[e].label}</Link>
            ))}
          </div>
          <div className="filters__row">
            <span className="filters__label">場面</span>
            <Link href={href(sp, { tab: undefined })} className={`chip${!sp.tab ? ' is-active' : ''}`}>すべて</Link>
            {TABS.map((t) => (
              <Link key={t.key} href={href(sp, { tab: t.key })} className={`chip${sp.tab === t.key ? ' is-active' : ''}`}>{t.label}</Link>
            ))}
          </div>
          <div className="filters__result">{groups.length}の戦争・{totalComments}件の解説</div>
        </div>

        <div className="wanta-list">
          {shown.map(({ war, entries }) => (
            <section key={war.id} className="card wanta-group">
              <header className="wanta-group__head">
                <Link href={`/wars/${war.id}`} className="wanta-group__name">{war.name}</Link>
                <span className="muted">{formatPeriod(war.year, war.endYear, war.ongoing)}</span>
              </header>
              <ul>
                {entries.map((e) => (
                  <li key={e.key} className="wanta-entry">
                    <Link href={`/wars/${war.id}#${e.anchor}`} className="wanta-entry__tab">{e.label}</Link>
                    <p>{e.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {groups.length === 0 && <p className="muted" style={{ padding: '32px 0' }}>該当する解説が見つからなかったワン。</p>}

        {pages > 1 && (
          <nav className="pager" aria-label="ページ">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={href(sp, { page: p === 1 ? undefined : String(p) })}
                className={`chip${p === page ? ' is-active' : ''}`} aria-current={p === page ? 'page' : undefined}>{p}</Link>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
