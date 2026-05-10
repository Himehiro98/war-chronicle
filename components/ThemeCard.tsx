'use client';

import Link from 'next/link';
import { ModernTheme } from '@/lib/types';

interface Props {
  theme: ModernTheme;
}

export default function ThemeCard({ theme }: Props) {
  return (
    <Link href={`/themes/${theme.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}15)`,
        border: `1px solid ${theme.accent}30`,
        borderLeft: `4px solid ${theme.accent}`,
        borderRadius: 8,
        padding: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}25)`;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}15)`;
        e.currentTarget.style.transform = 'translateX(0)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>{theme.emoji}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            color: theme.accent, textTransform: 'uppercase',
          }}>
            現代の問い
          </span>
        </div>

        <div style={{
          fontSize: 15, fontWeight: 700, color: '#0f172a',
          lineHeight: 1.4, marginBottom: 10, fontFamily: 'serif',
        }}>
          {theme.question}
        </div>

        <p style={{
          fontSize: 11, lineHeight: 1.7, color: '#334155',
          marginBottom: 12, flex: 1,
        }}>
          {theme.shortAnswer}
        </p>

        {/* キー概念タグ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {theme.keyConcepts.slice(0, 3).map((c) => (
            <span key={c} style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 10,
              background: `${theme.accent}15`, color: theme.accent,
              fontWeight: 600, letterSpacing: '0.02em',
            }}>
              {c}
            </span>
          ))}
        </div>

        <div style={{
          fontSize: 10, fontWeight: 700, color: theme.accent,
          paddingTop: 10, borderTop: `1px solid ${theme.accent}20`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{theme.keyWarIds.length}本の関連戦争</span>
          <span>歴史で読み解く →</span>
        </div>
      </div>
    </Link>
  );
}
