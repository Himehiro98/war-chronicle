'use client';

import { useState } from 'react';
import { War, TabContent } from '@/lib/types';

type TabId = 'digest' | 'detail' | 'perspectives' | 'structure' | 'legacy';

const TABS: { id: TabId; label: string }[] = [
  { id: 'digest', label: 'ダイジェスト（3分）' },
  { id: 'detail', label: '詳説（10分）' },
  { id: 'perspectives', label: '各国の視点' },
  { id: 'structure', label: '構造分析' },
  { id: 'legacy', label: '歴史的連鎖' },
];

interface Props {
  war: War | null;
  isOpen: boolean;
  onClose: () => void;
  content: TabContent | null;
  isLoading: boolean;
  drawerHeight: number; // percentage of main area
  onResizeStart: (e: React.MouseEvent) => void;
}

function DigestTab({ data }: { data: TabContent['digest'] }) {
  const blocks = [
    { title: '背景', body: data.background },
    { title: '主要関係者と動機', body: data.actors },
    { title: '構造的要因', body: data.structural },
    { title: 'その後の連鎖', body: data.aftermath },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {blocks.map((b) => (
        <div key={b.title} className="rounded p-3" style={{ background: '#ede6d6', border: '1px solid rgba(42,34,24,0.15)' }}>
          <div className="text-rust mb-1.5 font-body" style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {b.title}
          </div>
          <div className="text-ink-mid" style={{ fontSize: 11, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: b.body }} />
        </div>
      ))}
    </div>
  );
}

function DetailTab({ data }: { data: TabContent['detail'] }) {
  return (
    <div>
      <h2 className="font-serif text-ink mb-1" style={{ fontSize: 16 }}>{data.title}</h2>
      <p className="text-ink-light mb-3" style={{ fontSize: 10, letterSpacing: '0.05em' }}>{data.kicker}</p>
      <p className="text-ink-mid mb-3.5 italic" style={{ fontSize: 12, lineHeight: 1.75, borderLeft: '3px solid #f0d5c8', paddingLeft: 12 }}>
        {data.lead}
      </p>
      {data.sections.map((s, i) => (
        <div key={i} className="mb-4">
          <div className="text-rust mb-2" style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            {s.heading}
          </div>
          <p className="text-ink" style={{ fontSize: 11, lineHeight: 1.75 }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function PerspectivesTab({ data }: { data: TabContent['perspectives'] }) {
  return (
    <div>
      <div className="text-ink-light mb-2.5" style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        この戦争を各国はどう語るか
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {data.map((p, i) => (
          <div
            key={i}
            className="rounded p-2.5"
            style={{
              border: '1px solid rgba(42,34,24,0.15)',
              background: '#ede6d6',
              gridColumn: p.wide ? '2 / 4' : undefined,
            }}
          >
            <div className="text-rust mb-1" style={{ fontSize: 10, letterSpacing: '0.05em', fontWeight: 600 }}>
              {p.flag} {p.nation}
            </div>
            <p className="text-ink-mid" style={{ fontSize: 10, lineHeight: 1.6 }}>{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StructureTab({ data }: { data: TabContent['structure'] }) {
  return (
    <div className="text-ink-mid" style={{ fontSize: 11, lineHeight: 1.75 }}>
      <div className="mb-2.5 p-2.5 rounded-sm" style={{ background: '#f0d5c8', borderLeft: '3px solid #8b3a1e' }}>
        <div className="text-rust mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          構造的必然性
        </div>
        {data.summary}
      </div>
      {data.factors.map((f, i) => (
        <div key={i} className="mb-3">
          <div className="text-rust mb-1" style={{ fontWeight: 600 }}>
            {`${'①②③'[i]} ${f.title}`}
          </div>
          <p>{f.body}</p>
        </div>
      ))}
    </div>
  );
}

function LegacyTab({ data }: { data: TabContent['legacy'] }) {
  const colors: Record<string, string> = {
    直接的連鎖: '#8b3a1e',
    中期的波及: '#1a4a42',
    長期的構造: '#b8860b',
  };
  return (
    <div style={{ fontSize: 11, lineHeight: 1.75 }}>
      {data.map((l, i) => (
        <div
          key={i}
          className="flex items-start gap-3 mb-3 pb-3"
          style={{ borderBottom: i < data.length - 1 ? '1px solid rgba(42,34,24,0.15)' : undefined }}
        >
          <div
            className="text-white flex-shrink-0 mt-0.5"
            style={{ background: colors[l.label] || '#8b3a1e', fontSize: 9, padding: '3px 8px', borderRadius: 3, whiteSpace: 'nowrap' }}
          >
            {l.label}
          </div>
          <p className="text-ink-mid">{l.text}</p>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded" style={{ background: '#ede6d6' }} />
      ))}
    </div>
  );
}

export default function DetailDrawer({ war, isOpen, onClose, content, isLoading, drawerHeight, onResizeStart }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('digest');

  if (!war) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex flex-col"
      style={{
        background: '#f5f0e8',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 10,
        height: `${drawerHeight}%`,
        boxShadow: '0 -4px 24px rgba(42,34,24,0.15)',
      }}
    >
      {/* 垂直リサイズハンドル ↕ */}
      <div
        onMouseDown={onResizeStart}
        title="ドラッグで高さ調整"
        style={{
          height: 10,
          flexShrink: 0,
          cursor: 'row-resize',
          background: 'rgba(42,34,24,0.12)',
          borderTop: '2px solid #8b3a1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,30,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(42,34,24,0.12)')}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(42,34,24,0.5)' }} />
          ))}
        </div>
      </div>

      {/* タイトルバー */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 cursor-pointer"
        style={{ background: '#2a2218', borderBottom: '1px solid rgba(42,34,24,0.15)' }}
        onClick={onClose}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-parch" style={{ fontSize: 15 }}>{war.name}</span>
          <span style={{ fontSize: 10, color: '#9a8f7a' }}>{war.year} – {war.endYear}</span>
          <span style={{ fontSize: 9, color: '#9a8f7a', letterSpacing: '0.06em' }}>{war.theater}</span>
        </div>
        <button
          className="text-parch border border-parch/30 hover:bg-rust hover:border-rust transition-colors"
          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 3, background: 'transparent', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ✕ 閉じる
        </button>
      </div>

      {/* タブ */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(42,34,24,0.15)', background: '#e8e0cc' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="transition-all duration-150"
            style={{
              padding: '7px 14px',
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderBottom: activeTab === t.id ? '2px solid #8b3a1e' : '2px solid transparent',
              color: activeTab === t.id ? '#8b3a1e' : '#7a6e5c',
              background: activeTab === t.id ? '#f5f0e8' : 'transparent',
              borderRight: '1px solid rgba(42,34,24,0.15)',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="overflow-y-auto flex-1 p-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : content ? (
          <>
            {activeTab === 'digest' && <DigestTab data={content.digest} />}
            {activeTab === 'detail' && <DetailTab data={content.detail} />}
            {activeTab === 'perspectives' && <PerspectivesTab data={content.perspectives} />}
            {activeTab === 'structure' && <StructureTab data={content.structure} />}
            {activeTab === 'legacy' && <LegacyTab data={content.legacy} />}
          </>
        ) : (
          <p className="text-ink-light" style={{ fontSize: 12 }}>コンテンツを読み込んでいます…</p>
        )}
      </div>
    </div>
  );
}
