'use client';

import { useState } from 'react';
import { War, TabContent } from '@/lib/types';
import { WANTA_COMMENTS } from '@/lib/wanta';
import WantaBubble from './WantaBubble';

type TabId = 'digest' | 'detail' | 'perspectives' | 'structure' | 'legacy';

const TABS: { id: TabId; label: string; emoji: string; accent: string }[] = [
  { id: 'digest',       label: 'ダイジェスト', emoji: '📋', accent: '#2563eb' },
  { id: 'detail',       label: '詳説',         emoji: '📖', accent: '#d97706' },
  { id: 'perspectives', label: '各国の視点',   emoji: '🌍', accent: '#059669' },
  { id: 'structure',    label: '構造分析',     emoji: '🔍', accent: '#7c3aed' },
  { id: 'legacy',       label: '歴史的連鎖',   emoji: '🔗', accent: '#dc2626' },
];

interface Props {
  war: War | null;
  isOpen: boolean;
  onClose: () => void;
  content: TabContent | null;
  isLoading: boolean;
  drawerHeight: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

/* ── DigestTab ── */
function DigestTab({ data }: { data: TabContent['digest'] }) {
  const blocks = [
    { title: '歴史的背景', body: data.background, icon: '🏛️', bg: '#eff6ff', border: '#3b82f6', header: '#1d4ed8' },
    { title: '主要関係者と動機', body: data.actors, icon: '⚔️', bg: '#fff7ed', border: '#f97316', header: '#c2410c' },
    { title: '構造的要因', body: data.structural, icon: '⚙️', bg: '#f5f3ff', border: '#8b5cf6', header: '#5b21b6' },
    { title: 'その後の連鎖', body: data.aftermath, icon: '🌊', bg: '#f0fdfa', border: '#14b8a6', header: '#0f766e' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {blocks.map((b) => (
        <div key={b.title} className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${b.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2"
            style={{ background: b.header }}>
            <span style={{ fontSize: 13 }}>{b.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {b.title}
            </span>
          </div>
          <div className="p-3" style={{ background: b.bg, fontSize: 11, lineHeight: 1.7, color: '#374151' }}
            dangerouslySetInnerHTML={{ __html: b.body }} />
        </div>
      ))}
    </div>
  );
}

/* ── DetailTab ── */
function DetailTab({ data }: { data: TabContent['detail'] }) {
  return (
    <div>
      <div className="mb-4 pb-3" style={{ borderBottom: '2px solid #d97706' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', fontFamily: 'serif', marginBottom: 4 }}>
          {data.title}
        </h2>
        <p style={{ fontSize: 10, color: '#78716c', letterSpacing: '0.06em' }}>{data.kicker}</p>
      </div>
      <div className="mb-4 px-3 py-2.5 rounded-lg"
        style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', fontSize: 12, lineHeight: 1.8, color: '#44403c', fontStyle: 'italic' }}>
        {data.lead}
      </div>
      {data.sections.map((s, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.04em' }}>{s.heading}</span>
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.8, color: '#44403c', paddingLeft: 32 }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ── PerspectivesTab ── */
const PERSPECTIVE_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

function PerspectivesTab({ data }: { data: TabContent['perspectives'] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: 13 }}>🌍</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.04em' }}>
          この戦争を各国はどう語るか
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {data.map((p, i) => {
          const color = PERSPECTIVE_COLORS[i % PERSPECTIVE_COLORS.length];
          return (
            <div key={i} className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                gridColumn: p.wide ? '2 / 4' : undefined,
              }}>
              <div className="px-3 py-2 flex items-center gap-2"
                style={{ background: color }}>
                <span style={{ fontSize: 14 }}>{p.flag}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
                  {p.nation}
                </span>
              </div>
              <div className="p-3"
                style={{ background: '#fafaf9', fontSize: 10.5, lineHeight: 1.7, color: '#44403c' }}>
                {p.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── StructureTab ── */
const BAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];

function StructureTab({ data }: { data: TabContent['structure'] }) {
  return (
    <div>
      <div className="mb-4 rounded-lg p-3"
        style={{ background: '#f5f3ff', border: '1px solid #8b5cf6', borderLeft: '4px solid #7c3aed' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 13 }}>🔍</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#5b21b6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            構造的必然性の評価
          </span>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: '#3730a3' }}>{data.summary}</p>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        主要因子の影響度分析
      </div>

      <div className="space-y-3">
        {data.factors.map((f, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1">
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                {f.title}
              </span>
            </div>
            <p style={{ fontSize: 10, lineHeight: 1.6, color: '#6b7280', marginBottom: 6 }}>{f.body}</p>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: '#e5e7eb' }}>
              <div className="rounded-full h-full"
                style={{
                  width: '75%',
                  background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[(i + 1) % BAR_COLORS.length]})`,
                  transition: 'width 0.6s ease',
                }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── LegacyTab ── */
const LEGACY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '直接的連鎖': { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e' },
  '中期的波及': { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  '長期的構造': { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
};

function LegacyTab({ data }: { data: TabContent['legacy'] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: 13 }}>🔗</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>歴史的連鎖と長期的影響</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, #f43f5e, #10b981, #f59e0b)', borderRadius: 1 }} />
        {data.map((l, i) => {
          const c = LEGACY_COLORS[l.label] ?? { bg: '#f9fafb', text: '#374151', dot: '#6b7280' };
          return (
            <div key={i} className="flex gap-3 mb-3" style={{ paddingLeft: 28 }}>
              <div style={{
                position: 'absolute', left: 6, width: 10, height: 10, borderRadius: '50%',
                background: c.dot, border: '2px solid white', boxShadow: '0 0 0 1px ' + c.dot,
                marginTop: 6,
              }} />
              <div className="flex-1 rounded-lg overflow-hidden"
                style={{ border: `1px solid ${c.dot}20`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="px-3 py-1.5 flex items-center gap-1.5"
                  style={{ background: c.bg, borderBottom: `1px solid ${c.dot}30` }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {l.label}
                  </span>
                </div>
                <div className="px-3 py-2"
                  style={{ background: 'white', fontSize: 10.5, lineHeight: 1.7, color: '#44403c' }}>
                  {l.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          <div style={{ height: 36, background: '#e5e7eb' }} />
          <div style={{ height: 80, background: '#f9fafb', padding: 12 }}>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DetailDrawer({ war, isOpen, onClose, content, isLoading, drawerHeight, onResizeStart }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('digest');
  const activeConfig = TABS.find(t => t.id === activeTab)!;

  if (!war) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col"
      style={{
        background: '#fafaf9',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 10,
        height: `${drawerHeight}%`,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>

      {/* ↕ 垂直リサイズハンドル */}
      <div onMouseDown={onResizeStart} title="ドラッグで高さ調整"
        style={{
          height: 12, flexShrink: 0, cursor: 'row-resize',
          background: '#2a2218', borderTop: '2px solid #8b3a1e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#3d3024')}
        onMouseLeave={e => (e.currentTarget.style.background = '#2a2218')}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      </div>

      {/* タイトルバー */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ background: '#2a2218', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif" style={{ fontSize: 15, color: '#faf7f0', fontWeight: 600 }}>{war.name}</span>
              <span style={{ fontSize: 10, color: '#9a8f7a' }}>{war.year} – {war.endYear}</span>
            </div>
            <span style={{ fontSize: 9, color: '#7a6e5c', letterSpacing: '0.05em' }}>{war.theater}</span>
          </div>
          {/* COTENリンク */}
          {war.cotenLinks && war.cotenLinks.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {war.cotenLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px', borderRadius: 12, fontSize: 9, fontWeight: 600,
                    background: 'linear-gradient(135deg, #e8611a, #c84b0a)',
                    color: 'white', textDecoration: 'none', letterSpacing: '0.03em',
                    boxShadow: '0 1px 3px rgba(232,97,26,0.4)',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={e => e.stopPropagation()}>
                  🎙 COTEN: {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose}
          style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 4,
            background: 'rgba(255,255,255,0.08)', color: '#c8bfb0',
            border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
            letterSpacing: '0.04em',
          }}>
          ✕ 閉じる
        </button>
      </div>

      {/* タブバー */}
      <div className="flex flex-shrink-0" style={{ background: '#1f1a14', borderBottom: `2px solid ${activeConfig.accent}` }}>
        {TABS.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 16px', fontSize: 10, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.04em',
                background: isActive ? t.accent : 'transparent',
                color: isActive ? 'white' : '#9a8f7a',
                borderBottom: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
                marginBottom: -2,
                fontWeight: isActive ? 700 : 400,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* コンテンツ */}
      <div className="overflow-y-auto flex-1 p-4" style={{ background: '#f5f0e8' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : content ? (
          <>
            {activeTab === 'digest'       && <DigestTab       data={content.digest} />}
            {activeTab === 'detail'       && <DetailTab       data={content.detail} />}
            {activeTab === 'perspectives' && <PerspectivesTab data={content.perspectives} />}
            {activeTab === 'structure'    && <StructureTab    data={content.structure} />}
            {activeTab === 'legacy'       && <LegacyTab       data={content.legacy} />}
            <WantaBubble
              comment={WANTA_COMMENTS[war.id]?.[activeTab] ?? content.wanta?.[activeTab]}
              tabLabel={activeTab}
            />
          </>
        ) : (
          <p style={{ fontSize: 12, color: '#9ca3af' }}>コンテンツを読み込んでいます…</p>
        )}
      </div>
    </div>
  );
}
