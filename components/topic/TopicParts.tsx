import Link from 'next/link';
import { WAR_CONTENT } from '@/lib/content';
import { REGIONS } from '@/lib/wars';
import { firstSentence, formatPeriod } from '@/lib/text';
import type { War } from '@/lib/types';

export function TopicSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="topic-section">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** 関連する戦争を年代順のタイムラインで並べる */
export function RelatedWarTimeline({ wars }: { wars: War[] }) {
  const sorted = [...wars].sort((a, b) => a.year - b.year);
  return (
    <ol className="topic-wars">
      {sorted.map((w) => (
        <li key={w.id}>
          <Link href={`/wars/${w.id}`} className="topic-war">
            <span className="topic-war__meta">{formatPeriod(w.year, w.endYear, w.ongoing)}・{REGIONS[w.region]}</span>
            <span className="topic-war__name">{w.name}</span>
            <span className="topic-war__summary">{firstSentence(WAR_CONTENT[w.id]?.digest.background, 150)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
