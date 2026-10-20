import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { WAR_BY_ID } from '@/lib/war-data';
import { RelatedWarTimeline, TopicSection } from '@/components/topic/TopicParts';
import type { War } from '@/lib/types';

export const dynamicParams = false;
export function generateStaticParams() {
  return MODERN_THEMES.map((t) => ({ themeId: t.id }));
}
export function generateMetadata({ params }: { params: { themeId: string } }): Metadata {
  const t = MODERN_THEMES.find((x) => x.id === params.themeId);
  return t ? { title: `${t.question}｜現代の問い`, description: t.shortAnswer } : {};
}

export default function ThemePage({ params }: { params: { themeId: string } }) {
  const theme = MODERN_THEMES.find((t) => t.id === params.themeId);
  if (!theme) notFound();
  const wars = theme.keyWarIds.map((id) => WAR_BY_ID[id]).filter((w): w is War => !!w);
  const others = MODERN_THEMES.filter((t) => t.id !== theme.id);

  return (
    <main style={{ '--c': theme.accent } as React.CSSProperties}>
      <section className="page-hero">
        <div className="container-read">
          <nav className="crumbs"><Link href="/">ホーム</Link> ／ <Link href="/themes">現代の問い</Link></nav>
          <div className="eyebrow">現代の問い</div>
          <h1><span aria-hidden style={{ marginRight: 10 }}>{theme.emoji}</span>{theme.question}</h1>
          <p className="lead">{theme.shortAnswer}</p>
        </div>
      </section>

      <div className="container-read topic-body">
        <TopicSection eyebrow="Background" title="歴史的な背景">
          <p className="prose-jp">{theme.background}</p>
        </TopicSection>

        <TopicSection eyebrow="Key Concepts" title="読み解くための概念">
          <ul className="topic-concepts">
            {theme.keyConcepts.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </TopicSection>

        <TopicSection eyebrow="Wars" title={`背景にある${wars.length}つの戦争`}>
          <p className="muted" style={{ marginBottom: 12 }}>この問いの歴史的な構造を形づくった戦争を、年代順にたどります。</p>
          <RelatedWarTimeline wars={wars} />
        </TopicSection>

        <TopicSection eyebrow="Today" title="現在の状況">
          <p className="prose-jp">{theme.modernSituation}</p>
          <div className="callout callout--quiet" style={{ marginTop: 16 }}>
            <p>歴史的な背景を理解することは、現在の侵略や暴力を正当化することではありません。複数の解釈を並べ、単純な善悪で語らないことをこのサイトの基本にしています。</p>
          </div>
        </TopicSection>

        <section className="topic-section">
          <h2 className="panel-subhead">ほかの問い</h2>
          <div className="war-chip-list">
            {others.map((t) => (
              <Link key={t.id} href={`/themes/${t.id}`} className="war-chip">
                <span className="war-chip__name">{t.emoji} {t.question}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
