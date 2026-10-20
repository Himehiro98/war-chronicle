import Link from 'next/link';
import { ReligionTheme } from '@/lib/types';
import { stripHtml } from '@/lib/text';

export default function ReligionCard({ theme }: { theme: ReligionTheme }) {
  return (
    <Link href={`/religions/${theme.id}`} className="card feature-card" style={{ '--c': theme.accent } as React.CSSProperties}>
      <div className="feature-card__head">
        <span className="feature-card__emoji" aria-hidden>{theme.emoji}</span>
        <span className="feature-card__kicker">{theme.englishName}・{theme.period}</span>
      </div>
      <h3 className="feature-card__title">{theme.name}</h3>
      <p className="feature-card__desc">{stripHtml(theme.shortThesis)}</p>
      <div className="feature-card__tags">
        {theme.keyConcepts.slice(0, 3).map((c) => (
          <span key={c} className="tag">{c}</span>
        ))}
      </div>
      <div className="feature-card__foot">
        <span>関連する戦争 {theme.keyWarIds.length}件</span>
        <span className="feature-card__go">読み解く →</span>
      </div>
    </Link>
  );
}
