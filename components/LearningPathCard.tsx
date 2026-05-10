'use client';

import Link from 'next/link';
import { LearningPath } from '@/lib/types';

interface Props {
  path: LearningPath;
}

export default function LearningPathCard({ path }: Props) {
  return (
    <Link href={`/learn/${path.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        border: '1px solid rgba(15,23,42,0.08)',
        borderRadius: 12,
        padding: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
        e.currentTarget.style.borderColor = path.accent;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)';
      }}>
        {/* アクセントバー */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: path.accent,
        }} />

        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            fontSize: 26, lineHeight: 1, flexShrink: 0,
            width: 44, height: 44, borderRadius: 8,
            background: `${path.accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {path.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: path.accent,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
            }}>
              学習パス · {path.estimatedMinutes}分
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#0f172a',
              lineHeight: 1.3, fontFamily: 'serif',
            }}>
              {path.title}
            </div>
          </div>
        </div>

        {/* サブタイトル */}
        <div style={{
          fontSize: 11, color: '#475569', fontStyle: 'italic',
          marginBottom: 10, lineHeight: 1.5,
        }}>
          {path.subtitle}
        </div>

        {/* 説明 */}
        <p style={{
          fontSize: 11, lineHeight: 1.7, color: '#334155',
          marginBottom: 14, flex: 1,
        }}>
          {path.description}
        </p>

        {/* フッター：戦争数 + 矢印 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid rgba(15,23,42,0.06)',
        }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
            {path.warIds.length}本の戦争を辿る
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: path.accent,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            読み進める →
          </div>
        </div>
      </div>
    </Link>
  );
}
