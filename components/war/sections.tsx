import Link from 'next/link';
import type { ExamQuestion, HumanLayerData, LessonsData, TabContent, War } from '@/lib/types';
import { firstSentence, formatPeriod } from '@/lib/text';

/** 自前の静的データ（<strong>/<br> のみ）を描画する */
export function Html({ html, className = 'prose-jp' }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Block({ title, sub, children, tone }: { title: string; sub?: string; children: React.ReactNode; tone?: string }) {
  return (
    <section className="war-block" style={tone ? ({ '--tone': tone } as React.CSSProperties) : undefined}>
      <header className="war-block__head">
        <h3>{title}</h3>
        {sub && <span>{sub}</span>}
      </header>
      <div className="war-block__body">{children}</div>
    </section>
  );
}

/* ── 30秒でつかむ ── */
export function QuickGrasp({ content, lessons }: { content: TabContent; lessons: LessonsData | null }) {
  const items = [
    { label: '誰が', text: firstSentence(content.digest?.actors) },
    { label: 'なぜ', text: firstSentence(content.digest?.background) },
    { label: '結果', text: firstSentence(content.digest?.aftermath) },
    { label: '現代との接点', text: firstSentence(lessons?.modernLessons) },
  ].filter((i) => i.text);
  if (items.length < 2) return null;
  return (
    <aside className="quick-grasp" aria-label="30秒でつかむ">
      <div className="quick-grasp__title">30秒でつかむ</div>
      <dl>
        {items.map((i) => (
          <div key={i.label} className="quick-grasp__row">
            <dt>{i.label}</dt>
            <dd>{i.text}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

/* ── 概要 ── */
export function DigestPanel({ data }: { data: TabContent['digest'] }) {
  const blocks = [
    { title: '歴史的背景', body: data.background },
    { title: '主な当事者と動機', body: data.actors },
    { title: '構造的な要因', body: data.structural },
    { title: 'その後の連鎖', body: data.aftermath },
  ];
  return (
    <div className="war-grid-2">
      {blocks.map((b) => (
        <Block key={b.title} title={b.title}>
          <Html html={b.body} />
        </Block>
      ))}
    </div>
  );
}

/* ── 詳しく ── */
export function DetailPanel({ data }: { data: TabContent['detail'] }) {
  return (
    <article className="war-detail">
      <p className="war-detail__kicker">{data.kicker}</p>
      <h3 className="war-detail__title">{data.title}</h3>
      <p className="war-detail__lead">{data.lead}</p>
      {data.sections.map((s, i) => (
        <section key={i} className="war-detail__section">
          <h4><span className="war-detail__num">{i + 1}</span>{s.heading}</h4>
          <p>{s.body}</p>
        </section>
      ))}
    </article>
  );
}

/* ── 各国の視点 ── */
export function PerspectivesPanel({ data }: { data: TabContent['perspectives'] }) {
  return (
    <>
      <p className="panel-intro">同じ戦争でも、立場によって語られ方は大きく変わります。それぞれの「物語」を並べて読んでみてください。</p>
      <div className="war-grid-3">
        {data.map((p, i) => (
          <section key={i} className="war-block" style={p.wide ? { gridColumn: '1 / -1' } : undefined}>
            <header className="war-block__head">
              <h3><span aria-hidden style={{ marginRight: 6 }}>{p.flag}</span>{p.nation}</h3>
            </header>
            <div className="war-block__body"><p className="prose-jp prose-jp--sm">{p.text}</p></div>
          </section>
        ))}
      </div>
    </>
  );
}

/* ── 構造 ── */
export function StructurePanel({ data }: { data: TabContent['structure'] }) {
  return (
    <>
      <div className="callout">
        <div className="callout__label">構造的に見ると</div>
        <p>{data.summary}</p>
      </div>
      <h3 className="panel-subhead">主な要因</h3>
      <ol className="factor-list">
        {data.factors.map((f, i) => (
          <li key={i}>
            <div className="factor-list__title">{f.title}</div>
            <p>{f.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ── その後の連鎖 ── */
const LEGACY_ORDER = ['直接的連鎖', '中期的波及', '長期的構造'];
const LEGACY_SUB: Record<string, string> = {
  '直接的連鎖': '数年以内に起きたこと',
  '中期的波及': '数十年のあいだに広がった影響',
  '長期的構造': '現代まで残る構造',
};
export function LegacyPanel({ data, causes, influences }: { data: TabContent['legacy']; causes: War[]; influences: War[] }) {
  const sorted = [...data].sort((a, b) => LEGACY_ORDER.indexOf(a.label) - LEGACY_ORDER.indexOf(b.label));
  return (
    <>
      <ol className="legacy-timeline">
        {sorted.map((l, i) => (
          <li key={i}>
            <div className="legacy-timeline__label">{l.label}<span>{LEGACY_SUB[l.label] ?? ''}</span></div>
            <p>{l.text}</p>
          </li>
        ))}
      </ol>
      <RelatedWars causes={causes} influences={influences} />
    </>
  );
}

/* ── 市民の視点 ── */
const HUMAN_BLOCKS: { key: keyof HumanLayerData; title: string; sub: string }[] = [
  { key: 'civilianLife', title: '市民生活', sub: '配給・徴用・統制' },
  { key: 'refugees', title: '難民・避難', sub: 'どこへ逃げたか' },
  { key: 'hunger', title: '飢餓・物資不足', sub: '食べるものはあったか' },
  { key: 'trauma', title: '心の傷と世代継承', sub: 'PTSD・家族' },
  { key: 'children', title: '子どもたち', sub: '孤児・教育の中断' },
  { key: 'cityDestruction', title: '都市の破壊', sub: '失われた街' },
];
export function HumanPanel({ data }: { data: HumanLayerData }) {
  return (
    <>
      <p className="panel-intro">
        地図と年表の向こう側には、必ず暮らしがありました。戦争を「ゲーム」として消費しないために、市民の側から見た現実を記録します。
      </p>
      <section className="story">
        <div className="story__label">ある市民の一日</div>
        <Html html={data.oneDayStory} className="prose-jp story__body" />
        <p className="story__note">※史料をもとに再構成した物語です。特定の個人の記録ではありません。</p>
      </section>
      <div className="war-grid-2" style={{ marginTop: 20 }}>
        {HUMAN_BLOCKS.map((b) => data[b.key] ? (
          <Block key={b.key} title={b.title} sub={b.sub}>
            <Html html={data[b.key]} className="prose-jp prose-jp--sm" />
          </Block>
        ) : null)}
      </div>
    </>
  );
}

/* ── 教訓 ── */
const LESSON_BLOCKS: { key: keyof LessonsData; title: string; sub: string }[] = [
  { key: 'commonalities', title: '他の戦争との共通点', sub: 'パターンとして見る' },
  { key: 'universality', title: '普遍的なメカニズム', sub: 'なぜ繰り返すのか' },
  { key: 'preventable', title: '防ぐことはできたか', sub: '分岐点の検討' },
  { key: 'reproducibility', title: '再び起こりうるか', sub: '同じ条件が揃ったら' },
  { key: 'modernLessons', title: '現代への教訓', sub: '今の世界に引きつけて' },
];
export function LessonsPanel({ data }: { data: LessonsData }) {
  return (
    <div className="lesson-list">
      {LESSON_BLOCKS.map((b, i) => (
        <section key={b.key} className="lesson-item">
          <div className="lesson-item__num">{i + 1}</div>
          <div>
            <h3 className="lesson-item__title">{b.title}<span>{b.sub}</span></h3>
            <Html html={data[b.key]} />
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 論述問題 ── */
export function ExamPanel({ questions }: { questions: ExamQuestion[] }) {
  return (
    <>
      <div className="callout callout--quiet">
        <p>
          大学入試の論述形式にならった<strong>本サイトのオリジナル問題</strong>です（実在の入試問題の転載ではありません）。
          まず自分の言葉で答えを組み立ててから、解答例と比べてみてください。思い出して書くことが、読むだけより記憶に残ります。
        </p>
      </div>
      {questions.map((q, i) => (
        <section key={i} className="exam-item">
          <div className="exam-item__meta">
            <span className="exam-item__no">問{questions.length > 1 ? i + 1 : ''}</span>
            <span>{q.type}</span>
          </div>
          <p className="exam-item__q">{q.question}</p>
          <details className="exam-item__answer">
            <summary>解答例を見る</summary>
            <p>{q.answer}</p>
          </details>
        </section>
      ))}
    </>
  );
}

/* ── 考えてみよう ── */
export function ThinkPrompt({ question, hint }: { question: string; hint?: string }) {
  return (
    <aside className="think">
      <div className="think__label">考えてみよう</div>
      <p className="think__q">{question}</p>
      {hint && (
        <details className="think__hint">
          <summary>考えるヒント</summary>
          <p>{hint}</p>
        </details>
      )}
    </aside>
  );
}

/* ── わんたのひとこと ── */
export function WantaNote({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <aside className="wanta-note" aria-label="わんたのひとこと">
      <img src="/wanta.png" alt="" width={56} height={56} className="wanta-note__img" />
      <div className="wanta-note__bubble">
        <div className="wanta-note__name">わんたのひとこと</div>
        <p>{text}</p>
      </div>
    </aside>
  );
}

/* ── 前後に読む ── */
export function WarChip({ war }: { war: War }) {
  return (
    <Link href={`/wars/${war.id}`} className="war-chip">
      <span className="war-chip__name">{war.name}</span>
      <span className="war-chip__year">{formatPeriod(war.year, war.endYear, war.ongoing)}</span>
    </Link>
  );
}

export function RelatedWars({ causes, influences }: { causes: War[]; influences: War[] }) {
  if (causes.length === 0 && influences.length === 0) return null;
  return (
    <div className="related">
      {causes.length > 0 && (
        <div>
          <h3 className="panel-subhead">この戦争につながった出来事</h3>
          <div className="war-chip-list">{causes.map((w) => <WarChip key={w.id} war={w} />)}</div>
        </div>
      )}
      {influences.length > 0 && (
        <div>
          <h3 className="panel-subhead">この戦争が影響を与えた出来事</h3>
          <div className="war-chip-list">{influences.map((w) => <WarChip key={w.id} war={w} />)}</div>
        </div>
      )}
    </div>
  );
}
