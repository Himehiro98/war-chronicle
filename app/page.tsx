import Link from 'next/link';
import HeroGlobe from '@/components/home/HeroGlobe';
import LearningPathCard from '@/components/LearningPathCard';
import ThemeCard from '@/components/ThemeCard';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { RELIGION_THEMES } from '@/lib/religion-themes';
import { LIVE_CONFLICTS } from '@/lib/live-conflicts';
import { MYTHS } from '@/lib/myths';
import { TAGS, TAG_LIST } from '@/lib/tags';
import { WARS } from '@/lib/wars';
import { WAR_COUNT, YEAR_RANGE_LABEL } from '@/lib/site';

const STATUS_LABEL: Record<string, string> = { active: '戦闘継続', ceasefire: '停戦・移行期', frozen: '膠着' };

/** トップに出す「通説と史実」の例（戦争ID と、通説の文に含まれる語） */
const MYTH_SAMPLES: [string, string][] = [
  ['mongol-invasions', '神風'],
  ['napoleonic-wars', '背が低'],
  ['world-war-1', 'クリスマス'],
];

export default function Home() {
  const tagCount = new Map<string, number>();
  for (const w of WARS) for (const t of w.tags ?? []) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const patterns = TAG_LIST.map((t) => ({ ...TAGS[t], count: tagCount.get(t) ?? 0 })).sort((a, b) => b.count - a.count);
  const mythWarCount = Object.values(MYTHS).filter((m) => m.length).length;
  const mythTotal = Object.values(MYTHS).reduce((n, m) => n + m.length, 0);
  const mythSamples = MYTH_SAMPLES.flatMap(([id, keyword]) => {
    const m = MYTHS[id]?.find((e) => e.myth.includes(keyword));
    const w = WARS.find((x) => x.id === id);
    return m && w ? [{ id, name: w.name, myth: m.myth }] : [];
  });

  return (
    <main>
      {/* ── ヒーロー ── */}
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__text">
            <div className="eyebrow">{YEAR_RANGE_LABEL}・{WAR_COUNT}の戦争</div>
            <h1>
              戦争は突然起きない。<br />
              人類は<em>似た条件</em>で、<br className="br-pc" />何度も衝突してきた。
            </h1>
            <p className="lead">
              War Chronicle は、古代から現代までの戦争を時系列・地理・因果・構造の4つの軸で横断して読む歴史学習サイトです。
              過去のパターンを知ることで、いま起きている危機を読み解く手がかりを得ることを目指しています。
            </p>
            <div className="home-hero__ctas">
              <Link href="/chronicle" className="btn btn--primary">まずは通史で全体像をつかむ</Link>
              <Link href="/explore" className="btn btn--ghost-dark">年表と地図で探す</Link>
            </div>
          </div>
          <HeroGlobe />
        </div>
      </section>

      {/* ── 3つの入口 ── */}
      <section className="section--tight home-entry">
        <div className="container">
          <div className="entry-grid">
            <Link href="/chronicle" className="card entry-card">
              <span className="entry-card__step">はじめての人へ</span>
              <h2>通史を読む</h2>
              <p>6つの時代を順にたどり、戦争の「かたち」がどう変わってきたかを15分でつかみます。</p>
              <span className="entry-card__go">通史へ →</span>
            </Link>
            <Link href="/themes" className="card entry-card">
              <span className="entry-card__step">ニュースが気になる人へ</span>
              <h2>現代の問いから読む</h2>
              <p>「なぜロシアはNATOを恐れるのか」など、今の問いから過去の戦争へさかのぼります。</p>
              <span className="entry-card__go">現代の問いへ →</span>
            </Link>
            <Link href="/learn" className="card entry-card">
              <span className="entry-card__step">体系的に学びたい人へ</span>
              <h2>学習パスで読む</h2>
              <p>テーマごとに選んだ5〜10の戦争を順番に読み、理解度チェックで確かめながら進みます。</p>
              <span className="entry-card__go">学習パスへ →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 通説と史実 ── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <div className="eyebrow">Myths &amp; Facts</div>
              <h2>その「常識」は史実ですか？</h2>
              <p>
                戦争には、後からつくられた物語が史実のように語られているものがあります。
                広く知られた説と研究でわかっていることを並べて、{mythWarCount}の戦争について{mythTotal}件を確かめています。
              </p>
            </div>
            <Link href="/myths" className="home-more">すべての通説と史実 →</Link>
          </div>
          <div className="card-grid">
            {mythSamples.map((s) => (
              <Link key={s.id} href={`/wars/${s.id}#myths`} className="card home-myth">
                <span className="home-myth__label">よく聞く説</span>
                <p className="home-myth__myth">{s.myth}</p>
                <span className="home-myth__go">{s.name}の史実を見る →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── いま起きている戦争 ── */}
      <section className="home-live">
        <div className="container">
          <div className="home-live__head">
            <div>
              <div className="eyebrow">Now</div>
              <h2>いま続いている戦争</h2>
            </div>
            <Link href="/live" className="home-more">現状と数字を見る →</Link>
          </div>
          <ul className="home-live__list">
            {LIVE_CONFLICTS.map((c) => (
              <li key={c.id}>
                <Link href={`/wars/${c.id}`} className="home-live__item">
                  <span className={`status-dot status-dot--${c.status}`} aria-hidden />
                  <span className="home-live__name">{c.name}</span>
                  <span className="home-live__status">{STATUS_LABEL[c.status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 学習パス ── */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <div className="eyebrow">Learning Paths</div>
              <h2>どこから読めばいいか迷ったら</h2>
              <p>テーマごとに読む順番を決めた学習パスです。1本あたり40〜60分が目安です。</p>
            </div>
            <Link href="/learn" className="home-more">すべての学習パス →</Link>
          </div>
          <div className="card-grid">
            {LEARNING_PATHS.slice(0, 3).map((p) => <LearningPathCard key={p.id} path={p} />)}
          </div>
        </div>
      </section>

      {/* ── 現代の問い ── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <div className="eyebrow">Modern Questions</div>
              <h2>現代の問いから歴史を読む</h2>
              <p>ニュースで見る対立の多くは、過去の戦争の積み重ねの上にあります。</p>
            </div>
            <Link href="/themes" className="home-more">すべての問い →</Link>
          </div>
          <div className="card-grid card-grid--4">
            {MODERN_THEMES.map((t) => <ThemeCard key={t.id} theme={t} />)}
          </div>
        </div>
      </section>

      {/* ── 構造で見る ── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Structural Patterns</div>
            <h2>戦争を「構造」で見る</h2>
            <p>
              戦争を英雄や悪役の物語としてではなく、繰り返し現れる条件の組み合わせとして見ると、時代を越えた共通点が見えてきます。
              各戦争には{TAG_LIST.length}種類の構造パターンを付けています。
            </p>
          </div>
          <div className="pattern-grid">
            {patterns.map((p) => (
              <Link key={p.tag} href={`/patterns?tag=${encodeURIComponent(p.tag)}`} className="pattern-link">
                <span className="pattern-link__emoji" aria-hidden>{p.emoji}</span>
                <span className="pattern-link__body">
                  <span className="pattern-link__name">{p.tag}<span className="count">{p.count}</span></span>
                  <span className="pattern-link__desc">{p.shortDesc}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="tool-grid">
            <Link href="/patterns" className="card tool-card">
              <h3>パターン進化</h3>
              <p>同じ構造パターンが、時代ごとにどう形を変えて現れたかを比べます。</p>
            </Link>
            <Link href="/chains" className="card tool-card">
              <h3>因果の大河</h3>
              <p>ある戦争の結果が次の戦争の原因になる——その連鎖をたどります。</p>
            </Link>
            <Link href="/lessons" className="card tool-card">
              <h3>教訓を横断する</h3>
              <p>「防げたか」「再び起こりうるか」を全戦争で横断して読みます。</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 宗教 ── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <div className="eyebrow">Religion</div>
              <h2>宗教から読み解く</h2>
              <p>宗教は戦争の原因なのか、それとも戦争を語るための言葉なのか。主要5宗教から考えます。</p>
            </div>
            <Link href="/religions" className="home-more">宗教から読む →</Link>
          </div>
          <div className="religion-row">
            {RELIGION_THEMES.map((r) => (
              <Link key={r.id} href={`/religions/${r.id}`} className="card religion-pill" style={{ '--c': r.accent } as React.CSSProperties}>
                <span aria-hidden className="religion-pill__emoji">{r.emoji}</span>
                <span className="religion-pill__name">{r.name}</span>
                <span className="religion-pill__count">関連 {r.keyWarIds.length}件</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 試す ── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Practice</div>
            <h2>読んだら、試してみる</h2>
          </div>
          <div className="tool-grid">
            <Link href="/flashcards" className="card tool-card">
              <h3>フラッシュカード</h3>
              <p>思い出す練習で、読んだ内容を記憶に定着させます。</p>
            </Link>
            <Link href="/diagnose" className="card tool-card">
              <h3>AIパターン診断</h3>
              <p>今のニュースや状況を入力すると、似た構造の過去の戦争をAIが探します。</p>
            </Link>
            <Link href="/risk-check" className="card tool-card">
              <h3>構造リスク診断</h3>
              <p>チェックリストで、ある地域に戦争の前兆となる条件がどれだけ揃っているかを見ます。</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 編集方針 ── */}
      <section className="home-policy">
        <div className="container-read">
          <h2>このサイトの書き方について</h2>
          <p>
            戦争をできるだけ単純な善悪で語らず、当事国・市民・国際社会・後世の評価など複数の視点を並べて書いています。
            一方で、侵略や虐殺を「どちらもどちら」と相対化することもしません。歴史的背景の説明は、行為の正当化を意味しません。
          </p>
          <p>
            死者数などの数値には推計の幅があり、資料によって異なります。気になった戦争は、専門書や一次資料にもあたってみてください。
          </p>
        </div>
      </section>
    </main>
  );
}
