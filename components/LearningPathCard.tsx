import Link from 'next/link';
import { LearningPath } from '@/lib/types';

export default function LearningPathCard({ path }: { path: LearningPath }) {
  return (
    <Link href={`/learn/${path.id}`} className="card feature-card" style={{ '--c': path.accent } as React.CSSProperties}>
      <div className="feature-card__head">
        <span className="feature-card__emoji" aria-hidden>{path.emoji}</span>
        <span className="feature-card__kicker">学習パス・約{path.estimatedMinutes}分</span>
      </div>
      <h3 className="feature-card__title">{path.title}</h3>
      <p className="feature-card__sub">{path.subtitle}</p>
      <p className="feature-card__desc">{path.description}</p>
      <div className="feature-card__foot">
        <span>{path.warIds.length}の戦争を順に読む</span>
        <span className="feature-card__go">はじめる →</span>
      </div>
    </Link>
  );
}
