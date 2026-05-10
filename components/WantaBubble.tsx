'use client';

import { useState } from 'react';

interface Props {
  comment: string | undefined;
  tabLabel?: string;
}

const TAB_PROMPTS: Record<string, string> = {
  digest:       '要点だワン！',
  detail:       'ちょっとした豆知識だワン🦴',
  perspectives: '各国の見方の違いに注目だワン！',
  structure:    'もし〇〇だったら…どうなったかな？',
  legacy:       '今の世界にどう繋がってるかワン！',
};

const FALLBACK = 'この戦争、奥が深いんだワン！もう少し詳しく勉強してくるから待っててだワン🐾';

export default function WantaBubble({ comment, tabLabel }: Props) {
  const [imgError, setImgError] = useState(false);
  const text = comment ?? FALLBACK;
  const prompt = tabLabel ? TAB_PROMPTS[tabLabel] : undefined;

  return (
    <div style={{
      display: 'flex',
      gap: 14,
      alignItems: 'flex-end',
      marginTop: 24,
      paddingTop: 16,
      borderTop: '1px dashed rgba(245, 158, 11, 0.3)',
    }}>
      {/* わんたアイコン */}
      <div style={{
        flexShrink: 0,
        width: 88,
        height: 88,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        border: '3px solid #f59e0b',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
      }}>
        {!imgError ? (
          <img
            src="/wanta.png"
            alt="わんた"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>🐕</span>
        )}
      </div>

      {/* 吹き出し */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        border: '2px solid #f59e0b',
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)',
      }}>
        {/* 吹き出しの矢印 */}
        <div style={{
          position: 'absolute',
          left: -12,
          bottom: 22,
          width: 0,
          height: 0,
          borderTop: '9px solid transparent',
          borderBottom: '9px solid transparent',
          borderRight: '12px solid #f59e0b',
        }} />
        <div style={{
          position: 'absolute',
          left: -9,
          bottom: 23,
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '10px solid #fffbeb',
        }} />

        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 5,
          paddingBottom: 5,
          borderBottom: '1px solid rgba(245,158,11,0.2)',
        }}>
          <span style={{ fontSize: 11 }}>🐾</span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#92400e',
            letterSpacing: '0.08em',
          }}>
            わんたの解説
          </span>
          {prompt && (
            <span style={{
              fontSize: 9,
              color: '#d97706',
              fontStyle: 'italic',
              marginLeft: 'auto',
            }}>
              {prompt}
            </span>
          )}
        </div>

        {/* 本文 */}
        <div style={{
          fontSize: 11.5,
          lineHeight: 1.75,
          color: '#451a03',
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}
