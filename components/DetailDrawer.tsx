'use client';

import { useState } from 'react';
import { War, TabContent, LessonsData, HumanLayerData } from '@/lib/types';
import { WANTA_COMMENTS } from '@/lib/wanta';
import { LESSONS } from '@/lib/lessons';
import { HUMAN_LAYERS } from '@/lib/human-layers';
import WantaBubble from './WantaBubble';

type TabId = 'digest' | 'detail' | 'perspectives' | 'structure' | 'legacy' | 'human' | 'lessons';

const TABS: { id: TabId; label: string; emoji: string; accent: string; pinned?: boolean }[] = [
  { id: 'digest',       label: 'ダイジェスト', emoji: '📋', accent: '#2563eb' },
  { id: 'detail',       label: '詳説',         emoji: '📖', accent: '#d97706' },
  { id: 'perspectives', label: '各国の視点',   emoji: '🌍', accent: '#059669' },
  { id: 'structure',    label: '構造分析',     emoji: '🔍', accent: '#7c3aed' },
  { id: 'legacy',       label: '歴史的連鎖',   emoji: '🔗', accent: '#dc2626' },
  { id: 'human',        label: '市民',         emoji: '🕊️', accent: '#0891b2' },
  { id: 'lessons',      label: '教訓',         emoji: '💡', accent: '#b91c1c', pinned: true },
];

interface Props {
  war: War | null;
  isOpen: boolean;
  onClose: () => void;
  content: TabContent | null;
  isLoading: boolean;
  drawerHeight: number;
  onResizeStart: (e: React.MouseEvent) => void;
  isMobile?: boolean;
  fullscreen?: boolean;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {data.map((p, i) => {
          const color = PERSPECTIVE_COLORS[i % PERSPECTIVE_COLORS.length];
          return (
            <div key={i} className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                gridColumn: p.wide ? '1 / -1' : undefined,
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

/* ── HumanTab — 市民視点（戦争を地図ゲーム化しないため） ── */
const HUMAN_BLOCKS: { key: keyof HumanLayerData; title: string; icon: string; color: string; bg: string; desc: string }[] = [
  { key: 'civilianLife',    title: '市民生活',         icon: '🏠', color: '#0891b2', bg: '#ecfeff', desc: '配給・徴用・統制' },
  { key: 'refugees',        title: '難民・避難',       icon: '🚸', color: '#0284c7', bg: '#f0f9ff', desc: 'どこへ逃げたか' },
  { key: 'hunger',          title: '飢餓・物資不足',   icon: '🍞', color: '#a16207', bg: '#fefce8', desc: '配給制と餓死' },
  { key: 'trauma',          title: 'PTSD・世代継承',   icon: '💭', color: '#7c3aed', bg: '#f5f3ff', desc: '心の傷・家族崩壊' },
  { key: 'children',        title: '子どもへの影響',   icon: '👶', color: '#db2777', bg: '#fdf2f8', desc: '孤児・教育中断' },
  { key: 'cityDestruction', title: '都市破壊',         icon: '🏚️', color: '#475569', bg: '#f8fafc', desc: '失われた街' },
];

function HumanTab({ data }: { data: HumanLayerData | undefined }) {
  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🕊️</div>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          この戦争の市民視点データは現在準備中だワン。<br />
          戦争を「地図ゲーム」化しないため、市民生活・難民・PTSD・子ども・都市破壊の記録を執筆中。
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* ヘッダー：戦争を「人」の視点で */}
      <div className="mb-4 rounded-lg p-3"
        style={{
          background: 'linear-gradient(135deg, #ecfeff, #cffafe)',
          border: '2px solid #0891b2',
          borderLeft: '6px solid #0891b2',
        }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 16 }}>🕊️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#155e75', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            人間視点 — 戦争を「地図ゲーム」化しない
          </span>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: '#164e63' }}>
          数字や戦略の影に、必ず<strong>市民</strong>がいた。難民・飢餓・PTSD・子どもへの影響——
          英雄譚として消費するのではなく、戦争の<strong>本当のコスト</strong>を記憶する。
        </p>
      </div>

      {/* 6軸グリッド */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        {HUMAN_BLOCKS.map((b) => (
          <div key={b.key} className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${b.color}30`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="px-3 py-2 flex items-center gap-2"
              style={{ background: b.color, color: 'white' }}>
              <span style={{ fontSize: 13 }}>{b.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
                {b.title}
              </span>
              <span style={{ fontSize: 9, opacity: 0.85, marginLeft: 'auto', fontStyle: 'italic' }}>
                {b.desc}
              </span>
            </div>
            <div className="p-3"
              style={{ background: b.bg, fontSize: 11, lineHeight: 1.7, color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: data[b.key] }} />
          </div>
        ))}
      </div>

      {/* 没入型「ある市民の一日」 */}
      <div className="rounded-lg overflow-hidden"
        style={{
          border: '2px solid #0891b2',
          background: 'linear-gradient(135deg, #f0fdfa, #ecfeff)',
        }}>
        <div className="px-4 py-2.5 flex items-center gap-2"
          style={{ background: '#155e75', color: 'white' }}>
          <span style={{ fontSize: 14 }}>📖</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
            ある市民の一日
          </span>
          <span style={{ fontSize: 9, marginLeft: 'auto', opacity: 0.8, fontStyle: 'italic' }}>
            没入型ストーリー
          </span>
        </div>
        <div className="p-4"
          style={{ fontSize: 12, lineHeight: 1.85, color: '#0c4a6e' }}
          dangerouslySetInnerHTML={{ __html: data.oneDayStory }} />
      </div>
    </div>
  );
}

/* ── LessonsTab — このクロニクルの核心 ── */
const LESSON_BLOCKS: { key: keyof LessonsData; title: string; icon: string; color: string; bg: string; desc: string }[] = [
  { key: 'commonalities',   title: '他の戦争との共通点',   icon: '🔁', color: '#0891b2', bg: '#ecfeff', desc: 'パターン認識' },
  { key: 'universality',    title: '普遍的メカニズム',     icon: '⚙️', color: '#7c3aed', bg: '#f5f3ff', desc: '科学的構造' },
  { key: 'modernLessons',   title: '現代世界への教訓',     icon: '🌐', color: '#b91c1c', bg: '#fef2f2', desc: '今へのつながり' },
  { key: 'preventable',     title: '防止可能性の分析',     icon: '🛡️', color: '#059669', bg: '#ecfdf5', desc: '止められたか？' },
  { key: 'reproducibility', title: '再現性・再発リスク',   icon: '⚠️', color: '#d97706', bg: '#fffbeb', desc: '同じ条件が揃ったら' },
];

function LessonsTab({ data }: { data: LessonsData | undefined }) {
  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          この戦争の教訓データは現在準備中だワン。<br />
          歴史的パターンと現代への示唆を執筆中やけん、もう少し待っててだワン🐾
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* ヘッダー：このクロニクルの核心 */}
      <div className="mb-4 rounded-lg p-3"
        style={{
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          border: '2px solid #b91c1c',
          borderLeft: '6px solid #b91c1c',
        }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#7f1d1d', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            このクロニクルの核心
          </span>
        </div>
        <p style={{ fontSize: 11, lineHeight: 1.7, color: '#991b1b' }}>
          過去の戦争を科学的に分析し、現代世界において<strong>戦争を防ぐ示唆</strong>を得る。
          パターンを発見し、再現性を見極めることで、未来の悲劇を回避するヒントを探す。
        </p>
      </div>

      {/* 5つの分析軸 */}
      <div className="space-y-3">
        {LESSON_BLOCKS.map((b) => (
          <div key={b.key} className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${b.color}40`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="px-3 py-2 flex items-center gap-2"
              style={{ background: b.color, color: 'white' }}>
              <span style={{ fontSize: 13 }}>{b.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
                {b.title}
              </span>
              <span style={{ fontSize: 9, opacity: 0.85, marginLeft: 'auto', fontStyle: 'italic' }}>
                {b.desc}
              </span>
            </div>
            <div className="p-3"
              style={{ background: b.bg, fontSize: 11.5, lineHeight: 1.75, color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: data[b.key] }} />
          </div>
        ))}
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

export default function DetailDrawer({ war, isOpen, onClose, content, isLoading, drawerHeight, onResizeStart, isMobile = false, fullscreen = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('digest');
  const activeConfig = TABS.find(t => t.id === activeTab)!;

  if (!war) return null;

  // fullscreen: 全端末でフルスクリーン詳細ページ（年表と完全分離）
  const isFullscreen = fullscreen || isMobile;

  return (
    <div className="flex flex-col"
      style={{
        background: '#fafaf9',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        ...(isFullscreen ? {
          // 全端末フルスクリーン
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          // overflow:hidden は付けない。内側の overflow-y-auto コンテンツを iOS が
          // 正しくスクロールできなくなる原因になる
        } : {
          // 旧PC：下からスライドアップ（互換用、現在は使われない）
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: `${drawerHeight}%`,
          zIndex: 30,
        }),
      }}>

      {/* ↕ リサイズハンドル（フルスクリーンでない時のみ） */}
      {!isFullscreen && (
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
      )}

      {/* タイトルバー（モバイル：縦積み、PC：横並び） */}
      <div className={isMobile ? 'flex-shrink-0' : 'flex items-center justify-between px-4 py-2 flex-shrink-0'}
        style={{
          background: '#2a2218',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: isMobile ? '10px 14px' : undefined,
        }}>
        {isMobile ? (
          <>
            {/* モバイル：1行目に閉じるボタン+メタ、2行目に戦争名、3行目にCOTEN */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="wd-war-meta" style={{ fontSize: 11, color: '#9a8f7a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {war.year} – {war.endYear} ／ {war.theater}
              </div>
              <button onClick={onClose}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)', color: '#f0d5c8',
                  border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  letterSpacing: '0.04em', flexShrink: 0, marginLeft: 8,
                }}>
                ✕ 閉じる
              </button>
            </div>
            <div className="font-serif wd-war-title" style={{ fontSize: 17, color: '#faf7f0', fontWeight: 600, lineHeight: 1.35 }}>
              {war.name}
            </div>
            {war.cotenLinks && war.cotenLinks.length > 0 && (
              <div className="flex gap-1.5 flex-wrap" style={{ marginTop: 8 }}>
                {war.cotenLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: 'linear-gradient(135deg, #e8611a, #c84b0a)',
                      color: 'white', textDecoration: 'none', letterSpacing: '0.03em',
                      boxShadow: '0 1px 3px rgba(232,97,26,0.4)',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={e => e.stopPropagation()}>
                    🎙 {link.title}
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif" style={{ fontSize: 15, color: '#faf7f0', fontWeight: 600 }}>{war.name}</span>
                  <span style={{ fontSize: 10, color: '#9a8f7a' }}>{war.year} – {war.endYear}</span>
                </div>
                <span style={{ fontSize: 9, color: '#7a6e5c', letterSpacing: '0.05em' }}>{war.theater}</span>
              </div>
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
          </>
        )}
      </div>

      {/* タブバー */}
      <div className="flex-shrink-0 wd-tabs-bar"
        style={{
          background: '#1f1a14',
          borderBottom: `2px solid ${activeConfig.accent}`,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexWrap: 'nowrap',
          width: '100%',
        }}>
        <div style={{
          display: 'inline-flex',
          flexWrap: 'nowrap',
          minWidth: 'max-content',
          width: 'max-content',
        }}>
          {TABS.map((t) => {
            const isActive = t.id === activeTab;
            const isPinned = t.pinned;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  padding: isMobile ? '10px 12px' : '8px 16px',
                  fontSize: isMobile ? 11 : 10,
                  cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.04em',
                  background: isActive ? t.accent : (isPinned ? `${t.accent}25` : 'transparent'),
                  color: isActive ? 'white' : (isPinned ? '#fca5a5' : '#9a8f7a'),
                  borderBottom: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
                  borderLeft: isPinned && !isActive ? `2px solid ${t.accent}` : 'none',
                  marginBottom: -2,
                  marginLeft: isPinned && !isMobile ? 'auto' : 0,
                  fontWeight: isActive || isPinned ? 700 : 400,
                  transition: 'all 0.15s',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  position: 'relative',
                  flexShrink: 0,
                  flexGrow: 0,
                  flexBasis: 'auto',
                  whiteSpace: 'nowrap',
                  writingMode: 'horizontal-tb',
                  wordBreak: 'keep-all',
                  textOrientation: 'mixed',
                  minWidth: 'max-content',
                }}>
                <span style={{ display: 'inline-block', flexShrink: 0 }}>{t.emoji}</span>
                <span style={{
                  display: 'inline-block',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  writingMode: 'horizontal-tb',
                  wordBreak: 'keep-all',
                }}>{t.label}</span>
                {isPinned && !isActive && (
                  <span style={{
                    position: 'absolute', top: 2, right: 4,
                    width: 6, height: 6, borderRadius: '50%',
                    background: t.accent,
                    boxShadow: `0 0 6px ${t.accent}`,
                    animation: 'pulse 2s infinite',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="overflow-y-auto flex-1 p-4 wd-drawer-body" style={{ background: '#f5f0e8' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : content ? (
          <>
            {activeTab === 'digest'       && <DigestTab       data={content.digest} />}
            {activeTab === 'detail'       && <DetailTab       data={content.detail} />}
            {activeTab === 'perspectives' && <PerspectivesTab data={content.perspectives} />}
            {activeTab === 'structure'    && <StructureTab    data={content.structure} />}
            {activeTab === 'legacy'       && <LegacyTab       data={content.legacy} />}
            {activeTab === 'human'        && <HumanTab        data={HUMAN_LAYERS[war.id] ?? content.human} />}
            {activeTab === 'lessons'      && <LessonsTab      data={LESSONS[war.id] ?? content.lessons} />}
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
