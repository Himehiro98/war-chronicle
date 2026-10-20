import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RELIGION_THEMES } from '@/lib/religion-themes';
import { WAR_BY_ID } from '@/lib/war-data';
import { stripHtml } from '@/lib/text';
import { Html } from '@/components/war/sections';
import { RelatedWarTimeline, TopicSection } from '@/components/topic/TopicParts';
import type { War } from '@/lib/types';

export const dynamicParams = false;
export function generateStaticParams() {
  return RELIGION_THEMES.map((t) => ({ religionId: t.id }));
}
export function generateMetadata({ params }: { params: { religionId: string } }): Metadata {
  const t = RELIGION_THEMES.find((x) => x.id === params.religionId);
  return t ? { title: `${t.name}から歴史を読む`, description: stripHtml(t.shortThesis) } : {};
}

export default function ReligionPage({ params }: { params: { religionId: string } }) {
  const theme = RELIGION_THEMES.find((t) => t.id === params.religionId);
  if (!theme) notFound();
  const wars = theme.keyWarIds.map((id) => WAR_BY_ID[id]).filter((w): w is War => !!w);
  const others = RELIGION_THEMES.filter((t) => t.id !== theme.id);

  return (
    <main style={{ '--c': theme.accent } as React.CSSProperties}>
      <section className="page-hero">
        <div className="container-read">
          <nav className="crumbs"><Link href="/">ホーム</Link> ／ <Link href="/religions">宗教から読む</Link></nav>
          <div className="eyebrow">{theme.englishName}・{theme.period}</div>
          <h1><span aria-hidden style={{ marginRight: 10 }}>{theme.emoji}</span>{theme.name}</h1>
          <p className="lead">{stripHtml(theme.shortThesis)}</p>
        </div>
      </section>

      <div className="container-read topic-body">
        <TopicSection eyebrow="Origin" title="どのように生まれたか">
          <Html html={theme.origin} />
        </TopicSection>
        <TopicSection eyebrow="Beliefs" title="何を信じる宗教か">
          <Html html={theme.coreBeliefs} />
          <ul className="topic-concepts" style={{ marginTop: 16 }}>
            {theme.keyConcepts.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </TopicSection>
        <TopicSection eyebrow="Wars" title={`${wars.length}の戦争でたどる`}>
          <RelatedWarTimeline wars={wars} />
        </TopicSection>
        <TopicSection eyebrow="Paradox" title="この宗教が抱える矛盾">
          <Html html={theme.paradox} />
        </TopicSection>
        <TopicSection eyebrow="Today" title="現代の姿">
          <Html html={theme.modernSituation} />
          <div className="callout callout--quiet" style={{ marginTop: 16 }}>
            <p>宗教を戦争の「原因」と単純化せず、社会・政治・地政学と重なり合う現象として扱っています。特定の信仰や宗派を評価するものではありません。</p>
          </div>
        </TopicSection>

        <section className="topic-section">
          <h2 className="panel-subhead">ほかの宗教</h2>
          <div className="war-chip-list">
            {others.map((t) => (
              <Link key={t.id} href={`/religions/${t.id}`} className="war-chip">
                <span className="war-chip__name">{t.emoji} {t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
