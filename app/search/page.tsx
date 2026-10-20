import type { Metadata } from 'next';
import Link from 'next/link';
import { WAR_CONTENT } from '@/lib/content';
import { LESSONS } from '@/lib/lessons';
import { HUMAN_LAYERS } from '@/lib/human-layers';
import { MYTHS } from '@/lib/myths';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { RELIGION_THEMES } from '@/lib/religion-themes';
import { WARS_CHRONO } from '@/lib/war-data';
import { formatPeriod, stripHtml } from '@/lib/text';
import type { War } from '@/lib/types';

export const metadata: Metadata = {
  title: '全文検索',
  description: '戦争名・人物・地名・概念などのキーワードで、すべての戦争の本文・教訓・市民の視点を横断検索できます。',
};

const POPULAR = ['ヴェルサイユ条約', '民族自決', '核', '難民', '飢饉', '同盟', '宗教改革', '石油', '独立', 'クーデター', 'ジェノサイド', '海峡'];

type Hit = { label: string; tab: string; snippet: string };

function snippet(plain: string, q: string, width = 70) {
  const i = plain.indexOf(q);
  if (i < 0) return null;
  const s = Math.max(0, i - width);
  const e = Math.min(plain.length, i + q.length + width);
  return (s > 0 ? '…' : '') + plain.slice(s, e) + (e < plain.length ? '…' : '');
}

function Highlight({ text, q }: { text: string; q: string }) {
  const parts = text.split(q);
  return <>{parts.map((p, i) => <span key={i}>{p}{i < parts.length - 1 && <mark>{q}</mark>}</span>)}</>;
}

function searchWar(w: War, q: string): { score: number; hits: Hit[] } {
  const hits: Hit[] = [];
  let score = 0;
  if (w.name.includes(q)) { score += 100; }
  if ((w.tags ?? []).some((t) => t.includes(q))) { score += 30; hits.push({ label: '構造パターン', tab: 'overview', snippet: (w.tags ?? []).join('・') }); }
  if ((w.ideologies ?? []).some((t) => t.includes(q))) { score += 20; hits.push({ label: 'イデオロギー', tab: 'overview', snippet: (w.ideologies ?? []).join('・') }); }
  if (w.theater.includes(q)) { score += 20; hits.push({ label: '舞台', tab: 'overview', snippet: w.theater }); }

  const c = WAR_CONTENT[w.id];
  const fields: [string, string, string | undefined][] = [];
  if (c) {
    fields.push(['歴史的背景', 'overview', c.digest.background], ['当事者と動機', 'overview', c.digest.actors],
      ['構造的な要因', 'overview', c.digest.structural], ['その後の連鎖', 'overview', c.digest.aftermath],
      ['詳しく読む', 'story', [c.detail.lead, ...c.detail.sections.map((s) => `${s.heading} ${s.body}`)].join(' ')],
      ['各国の視点', 'perspectives', c.perspectives.map((p) => `${p.nation}：${p.text}`).join(' ')],
      ['構造', 'structure', [c.structure.summary, ...c.structure.factors.map((f) => `${f.title} ${f.body}`)].join(' ')],
      ['その後', 'legacy', c.legacy.map((l) => l.text).join(' ')]);
  }
  const l = LESSONS[w.id];
  if (l) fields.push(['教訓', 'lessons', [l.commonalities, l.universality, l.preventable, l.reproducibility, l.modernLessons].join(' ')]);
  const m = MYTHS[w.id];
  if (m?.length) fields.push(['通説と史実', 'myths', m.map((x) => `${x.myth} ${x.fact} ${x.why ?? ''}`).join(' ')]);
  const h = HUMAN_LAYERS[w.id];
  if (h) fields.push(['市民の視点', 'people', Object.values(h).join(' ')]);

  for (const [label, tab, raw] of fields) {
    const plain = stripHtml(raw);
    const sn = snippet(plain, q);
    if (sn) {
      score += label === '歴史的背景' ? 8 : 5;
      score += Math.min(plain.split(q).length - 1, 5);
      hits.push({ label, tab, snippet: sn });
    }
  }
  return { score, hits };
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim().slice(0, 50);
  const results = q
    ? WARS_CHRONO.map((w) => ({ w, ...searchWar(w, q) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score)
    : [];
  const themeHits = q
    ? [
        ...MODERN_THEMES.filter((t) => [t.question, t.shortAnswer, t.background, t.modernSituation, ...t.keyConcepts].join(' ').includes(q))
          .map((t) => ({ href: `/themes/${t.id}`, title: t.question, kind: '現代の問い' })),
        ...RELIGION_THEMES.filter((t) => stripHtml([t.name, t.shortThesis, t.origin, t.coreBeliefs, t.paradox, t.modernSituation, ...t.keyConcepts].join(' ')).includes(q))
          .map((t) => ({ href: `/religions/${t.id}`, title: t.name, kind: '宗教から読む' })),
      ]
    : [];

  return (
    <main>
      <section className="page-hero">
        <div className="container-read">
          <div className="eyebrow">Search</div>
          <h1>全文検索</h1>
          <p className="lead">戦争名・人物・地名・概念などで、すべての戦争の本文・各国の視点・教訓・市民の視点を横断して探せます。</p>
          <form action="/search" method="get" className="search-form" role="search">
            <label htmlFor="q" className="sr-only">キーワード</label>
            <input id="q" name="q" type="search" className="input" defaultValue={q} placeholder="例：ヴェルサイユ条約、難民、ビスマルク" autoFocus={!q} />
            <button type="submit" className="btn btn--primary">検索</button>
          </form>
        </div>
      </section>

      <div className="container-read search-body">
        {!q && (
          <section>
            <h2 className="panel-subhead">よく調べられているキーワード</h2>
            <div className="war-chip-list">
              {POPULAR.map((p) => <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="chip">{p}</Link>)}
            </div>
            <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
              構造パターン（ナショナリズム、安全保障ジレンマなど）で探すなら<Link href="/wars" style={{ color: 'var(--accent-ink)' }}>戦争一覧</Link>の絞り込みが便利です。
            </p>
          </section>
        )}

        {q && (
          <>
            <p className="search-count">「{q}」の検索結果：戦争 {results.length}件{themeHits.length > 0 && `・テーマ ${themeHits.length}件`}</p>
            {themeHits.length > 0 && (
              <div className="war-chip-list" style={{ marginBottom: 20 }}>
                {themeHits.map((t) => (
                  <Link key={t.href} href={t.href} className="war-chip">
                    <span className="war-chip__name">{t.title}</span>
                    <span className="war-chip__year">{t.kind}</span>
                  </Link>
                ))}
              </div>
            )}
            <ol className="search-results">
              {results.slice(0, 80).map(({ w, hits }) => (
                <li key={w.id} className="search-result">
                  <Link href={`/wars/${w.id}`} className="search-result__title">
                    <Highlight text={w.name} q={q} />
                  </Link>
                  <div className="search-result__meta">{formatPeriod(w.year, w.endYear, w.ongoing)}・{w.theater}</div>
                  <ul className="search-result__hits">
                    {hits.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <Link href={`/wars/${w.id}#${h.tab}`} className="search-result__label">{h.label}</Link>
                        <span><Highlight text={h.snippet} q={q} /></span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            {results.length > 80 && <p className="muted">上位80件を表示しています。キーワードを足して絞り込んでください。</p>}
            {results.length === 0 && themeHits.length === 0 && (
              <p className="muted" style={{ padding: '24px 0' }}>見つかりませんでした。表記を変える（例：「WW1」→「第一次世界大戦」）か、短いキーワードで試してください。</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
