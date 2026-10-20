import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { WAR_CONTENT } from '@/lib/content';
import { LESSONS } from '@/lib/lessons';
import { REGIONS } from '@/lib/wars';
import { WAR_BY_ID } from '@/lib/war-data';
import { firstSentence, formatPeriod } from '@/lib/text';
import { generateQuiz } from '@/lib/quiz';
import { PassedBadge, PathProgressProvider, ProgressBar, Quiz } from '@/components/learn/PathProgress';
import type { War } from '@/lib/types';

export const dynamicParams = false;
export function generateStaticParams() {
  return LEARNING_PATHS.map((p) => ({ pathId: p.id }));
}
export function generateMetadata({ params }: { params: { pathId: string } }): Metadata {
  const p = LEARNING_PATHS.find((x) => x.id === params.pathId);
  return p ? { title: `${p.title}｜学習パス`, description: p.description } : {};
}

export default function LearnPathPage({ params }: { params: { pathId: string } }) {
  const path = LEARNING_PATHS.find((p) => p.id === params.pathId);
  if (!path) notFound();
  const wars = path.warIds.map((id) => WAR_BY_ID[id]).filter((w): w is War => !!w);
  const others = LEARNING_PATHS.filter((p) => p.id !== path.id);

  return (
    <PathProgressProvider pathId={path.id} total={wars.length}>
      <main style={{ '--c': path.accent } as React.CSSProperties}>
        <section className="page-hero">
          <div className="container-read">
            <nav className="crumbs"><Link href="/">ホーム</Link> ／ <Link href="/learn">学習パス</Link></nav>
            <div className="eyebrow">学習パス・約{path.estimatedMinutes}分・{wars.length}の戦争</div>
            <h1><span aria-hidden style={{ marginRight: 10 }}>{path.emoji}</span>{path.title}</h1>
            <p className="lead">{path.description}</p>
            <p className="path-howto">
              上から順に読み進めてください。各戦争の最後にある「理解度チェック」は、読んだ直後に思い出すことで記憶に残りやすくするためのものです（任意）。
            </p>
          </div>
        </section>

        <div className="path-bar">
          <div className="container-read path-bar__inner">
            <Link href="/learn" className="path-bar__back">← 学習パス一覧</Link>
            <ProgressBar />
          </div>
        </div>

        <div className="container-read path-body">
          <ol className="path-steps">
            {wars.map((w, i) => {
              const bg = firstSentence(WAR_CONTENT[w.id]?.digest.background, 200);
              const lesson = firstSentence(LESSONS[w.id]?.modernLessons, 200);
              return (
                <li key={w.id} className="path-step">
                  <div className="path-step__num" aria-hidden>{i + 1}</div>
                  <article className="card path-step__card">
                    <div className="path-step__meta">
                      <span>{formatPeriod(w.year, w.endYear, w.ongoing)}</span>
                      <span>{REGIONS[w.region]}</span>
                      <PassedBadge warId={w.id} />
                    </div>
                    <h2 className="path-step__title">{w.name}</h2>
                    {bg && <p className="path-step__bg">{bg}</p>}
                    {lesson && (
                      <div className="path-step__lesson">
                        <div>現代への教訓</div>
                        <p>{lesson}</p>
                      </div>
                    )}
                    <Link href={`/wars/${w.id}`} className="btn btn--accent btn--sm">この戦争を詳しく読む →</Link>
                    <Quiz warId={w.id} quiz={generateQuiz(w)} />
                  </article>
                </li>
              );
            })}
          </ol>

          <section className="path-next">
            <h2 className="panel-subhead">ほかの学習パス</h2>
            <div className="war-chip-list">
              {others.map((p) => (
                <Link key={p.id} href={`/learn/${p.id}`} className="war-chip">
                  <span className="war-chip__name">{p.emoji} {p.title}</span>
                  <span className="war-chip__year">{p.warIds.length}の戦争・約{p.estimatedMinutes}分</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PathProgressProvider>
  );
}
