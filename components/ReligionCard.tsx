'use client';

import Link from 'next/link';
import { ReligionTheme } from '@/lib/types';

interface Props {
  theme: ReligionTheme;
}

export default function ReligionCard({ theme }: Props) {
  return (
    <Link href={`/religions/${theme.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}10, ${theme.accent}20)`,
        border: `1px solid ${theme.accent}40`,
        borderLeft: `5px solid ${theme.accent}`,
        borderRadius: 10,
        padding: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}30)`;
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.accent}10, ${theme.accent}20)`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 30 }}>{theme.emoji}</span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: theme.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              {theme.englishName}
            </div>
            <div className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {theme.name}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 9, color: theme.accent, marginBottom: 8, fontWeight: 600 }}>
          {theme.period}
        </div>

        <p style={{ fontSize: 11.5, lineHeight: 1.7, color: '#334155', flex: 1, marginBottom: 12 }}>
          {theme.shortThesis}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {theme.keyConcepts.slice(0, 3).map((c) => (
            <span key={c} style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 10,
              background: `${theme.accent}15`, color: theme.accent,
              fontWeight: 600,
            }}>
              {c}
            </span>
          ))}
        </div>

        <div style={{
          fontSize: 10, fontWeight: 700, color: theme.accent,
          paddingTop: 10, borderTop: `1px solid ${theme.accent}25`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{theme.keyWarIds.length}本の関連戦争</span>
          <span>歴史を読み解く →</span>
        </div>
      </div>
    </Link>
  );
}
