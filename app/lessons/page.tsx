import type { Metadata } from 'next';
import Link from 'next/link';
import { LESSONS } from '@/lib/lessons';
import { ERA_CONFIG } from '@/lib/wars';
import { WARS_CHRONO } from '@/lib/war-data';
import { formatPeriod, stripHtml } from '@/lib/text';
import { TAG_LIST } from '@/lib/tags';
import type { EraId, LessonsData, WarTag } from '@/lib/types';

export const metadata: Metadata = {
  title: '教訓を横断する',
  description: '「防ぐことはできたか」「再び起こりうるか」「現代への教訓」——全戦争の教訓を、観点ごとに年代順で横断して読む。',
};

const AXES: { key: keyof LessonsData; label: string; desc: string }[] = [
  { key: 'modernLessons', label: '現代への教訓', desc: '今の世界に引きつけると何が言えるか' },
  { key: 'preventable', label: '防ぐことはできたか', desc: '分岐点と、取りえた別の選択' },
  { key: 'reproducibility', label: '再び起こりうるか', desc: '同じ条件が揃ったときのリスク' },
  { key: 'universality', label: '普遍的なメカニズム', desc: 'なぜ繰り返されるのか' },
  { key: 'commonalities', label: '他の戦争との共通点', desc: '似た構造をもつ戦争' },
];
const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];

type SP = { axis?: string; tag?: string; era?: string; q?: string };

function href(cur: SP, patch: Partial<SP>) {
  const next = { ...cur, ...patch };
  const qs = new URLSearchParams();
  (Object.keys(next) as (keyof SP)[]).forEach((k) => { if (next[k]) qs.set(k, next[k]!); });
  const s = qs.toString();
  return s ? `/lessons?${s}` : '/lessons';
}

export default function LessonsPage({ searchParams }: { searchParams: SP }) {
  const axis = AXES.find((a) => a.key === searchParams.axis) ?? AXES[0];
  const sp: SP = {
    axis: axis.key === AXES[0].key ? undefined : axis.key,
    tag: TAG_LIST.includes(searchParams.tag as WarTag) ? searchParams.tag : undefined,
    era: ERA_ORDER.includes(searchParams.era as EraId) ? searchParams.era : undefined,
    q: searchParams.q?.trim() || undefined,
  };

  const items = WARS_CHRONO.filter((w) => LESSONS[w.id]).filter((w) => {
    if (sp.tag && !w.tags?.includes(sp.tag as WarTag)) return false;
    if (sp.era && w.era !== sp.era) return false;
    if (sp.q) {
      const l = LESSONS[w.id];
      const text = [w.name, w.theater, ...(w.tags ?? []), ...AXES.map((a) => stripHtml(l[a.key]))].join(' ');
      if (!text.includes(sp.q)) return false;
    }
    return true;
  });
  const total = WARS_CHRONO.filter((w) => LESSONS[w.id]).length;

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Lessons</div>
          <h1>教訓を横断する</h1>
          <p className="lead">
            各戦争の教訓を5つの観点で整理しています。観点を1つ選び、古代から現代まで年代順に読み比べると、
            同じ失敗がどう繰り返されてきたかが見えてきます。
          </p>
        </div>
      </section>

      <div className="container lessons-body">
        <nav className="axis-tabs" aria-label="観点を選ぶ">
          {AXES.map((a) => (
            <Link key={a.key} href={href(sp, { axis: a.key === AXES[0].key ? undefined : a.key })} scroll={false}
              className={`axis-tab${a.key === axis.key ? ' is-active' : ''}`} aria-current={a.key === axis.key ? 'page' : undefined}>
              <span className="axis-tab__label">{a.label}</span>
              <span className="axis-tab__desc">{a.desc}</span>
            </Link>
          ))}
        </nav>

        <div className="filters">
          <form action="/lessons" method="get" className="filters__row">
            {sp.axis && <input type="hidden" name="axis" value={sp.axis} />}
            {sp.tag && <input type="hidden" name="tag" value={sp.tag} />}
            {sp.era && <input type="hidden" name="era" value={sp.era} />}
            <input className="input" type="search" name="q" defaultValue={sp.q} placeholder="キーワードで絞り込む（例：同盟、核、飢饉）" style={{ maxWidth: 420 }} />
            <button type="submit" className="btn btn--ghost btn--sm">絞り込む</button>
          </form>
          <div className="filters__row">
            <span className="filters__label">時代</span>
            <Link href={href(sp, { era: undefined })} scroll={false} className={`chip${!sp.era ? ' is-active' : ''}`}>すべて</Link>
            {ERA_ORDER.map((e) => (
              <Link key={e} href={href(sp, { era: e })} scroll={false} className={`chip${sp.era === e ? ' is-active' : ''}`}>{ERA_CONFIG[e].label}</Link>
            ))}
          </div>
          <details className="filters__tags" open={!!sp.tag}>
            <summary>構造パターンで絞り込む{sp.tag ? `（${sp.tag}）` : ''}</summary>
            <div className="filters__row">
              <Link href={href(sp, { tag: undefined })} scroll={false} className={`chip${!sp.tag ? ' is-active' : ''}`}>指定なし</Link>
              {TAG_LIST.map((t) => (
                <Link key={t} href={href(sp, { tag: t })} scroll={false} className={`chip${sp.tag === t ? ' is-active' : ''}`}>{t}</Link>
              ))}
            </div>
          </details>
          <div className="filters__result">
            {items.length}件 / {total}件
            {(sp.tag || sp.era || sp.q) && <> ・ <Link href={href({ axis: sp.axis }, {})}>条件をクリア</Link></>}
          </div>
        </div>

        <h2 className="panel-subhead">「{axis.label}」を年代順に読む</h2>
        <ol className="lesson-feed">
          {items.map((w) => (
            <li key={w.id} className="lesson-feed__item">
              <div className="lesson-feed__head">
                <Link href={`/wars/${w.id}#lessons`} className="lesson-feed__name">{w.name}</Link>
                <span className="lesson-feed__year">{formatPeriod(w.year, w.endYear, w.ongoing)}</span>
              </div>
              <div className="prose-jp prose-jp--sm" dangerouslySetInnerHTML={{ __html: LESSONS[w.id][axis.key] }} />
              <Link href={`/wars/${w.id}#lessons`} className="lesson-feed__more">この戦争の教訓をすべて読む →</Link>
            </li>
          ))}
        </ol>
        {items.length === 0 && <p className="muted" style={{ padding: '32px 0' }}>条件に合う教訓が見つかりませんでした。</p>}
      </div>
    </main>
  );
}
