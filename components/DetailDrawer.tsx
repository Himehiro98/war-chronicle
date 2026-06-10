'use client';

import { useState, useCallback, useEffect } from 'react';
import { War, TabContent, LessonsData, HumanLayerData, WarTag } from '@/lib/types';
import { WANTA_COMMENTS } from '@/lib/wanta';
import { LESSONS } from '@/lib/lessons';
import { HUMAN_LAYERS } from '@/lib/human-layers';
import { WARS } from '@/lib/wars';
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

/* ── Claude公式ロゴ ── */
function ClaudeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
    </svg>
  );
}

/* ════════════════════════════════════════════════
   学習科学コンポーネント群
   - QuickGrasp: 先行オーガナイザー（Ausubel）
   - ThinkPrompt: 精緻化質問（Elaborative Interrogation）
   - RelatedWarsNav: 足場かけ（Vygotsky ZPD）
   - 学習モード切替: 認知負荷理論（Sweller）
   ════════════════════════════════════════════════ */

/* 学習モード */
export type LearnMode = 'beginner' | 'standard' | 'deep';
const MODE_OPTIONS: { id: LearnMode; label: string; emoji: string; title: string }[] = [
  { id: 'beginner', label: '入門', emoji: '🌱', title: '要点・市民・教訓の3タブだけ表示（初学者向け）' },
  { id: 'standard', label: '標準', emoji: '📖', title: '全7タブを表示' },
  { id: 'deep',     label: '深掘', emoji: '🔬', title: '全タブ＋関連資料・外部リンクを表示' },
];
const BEGINNER_TABS: TabId[] = ['digest', 'human', 'lessons'];

/* HTMLから最初の一文を抽出（先行オーガナイザー用） */
function firstSentence(html: string | undefined, max = 95): string {
  if (!html) return '';
  const plain = html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const idx = plain.indexOf('。');
  if (idx > 0 && idx < max) return plain.slice(0, idx + 1);
  return plain.length > max ? plain.slice(0, max) + '…' : plain;
}

/* ── 30秒でつかむ（先行オーガナイザー） ── */
function QuickGrasp({ content, lessons }: { content: TabContent; lessons: LessonsData | undefined }) {
  const items = [
    { icon: '👥', label: '誰が',          text: firstSentence(content.digest?.actors) },
    { icon: '❓', label: 'なぜ',          text: firstSentence(content.digest?.background) },
    { icon: '🏁', label: '結果',          text: firstSentence(content.digest?.aftermath) },
    { icon: '🔭', label: '現代との接点',  text: firstSentence(lessons?.modernLessons) },
  ].filter(i => i.text);
  if (items.length < 2) return null;
  return (
    <div className="mb-4 rounded-lg overflow-hidden"
      style={{ border: '2px solid #0ea5e9', boxShadow: '0 2px 8px rgba(14,165,233,0.15)' }}>
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#0284c7' }}>
        <span style={{ fontSize: 13 }}>⚡</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
          30秒でつかむ
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto', fontStyle: 'italic' }}>
          まず全体像から（読む前の地図）
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ background: '#f0f9ff' }}>
        {items.map((i) => (
          <div key={i.label} className="px-3 py-2.5 flex gap-2" style={{ borderBottom: '1px solid #e0f2fe' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{i.icon}</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#0369a1', letterSpacing: '0.08em', marginBottom: 2 }}>
                {i.label}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.6, color: '#1e3a5f' }}>{i.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 考えてみよう（精緻化質問） ── */
const THINK_TEMPLATES: Partial<Record<WarTag, string>> = {
  'ナショナリズム':       'もし「自分たちは特別な民族だ」という物語がなかったら、この戦争は起きたと思う？',
  '経済危機':             '経済の苦しさは、なぜ「外の敵」への攻撃に転化したんだろう？',
  '安全保障ジレンマ':     '「相手が攻めてくるかもしれないから先に備える」——この連鎖はどこで止められた？',
  '資源争奪':             'もしこの資源が無価値だったら、この地域の歴史はどう変わっていた？',
  '帝国衰退':             '衰退する大国は、なぜ「穏やかに退場」できないんだろう？',
  '宗教対立':             '宗教の違いは原因？それとも対立を正当化する「道具」として使われた？',
  '革命':                 '革命を起こした人々の理想と、その後の現実はなぜズレた？',
  '情報戦・プロパガンダ': '当時の人々は何を信じさせられていた？今の自分なら見抜けると思う？',
  '同盟暴走':             '味方を増やすための同盟が、なぜ戦争を拡大させる装置になった？',
  '核抑止':               '核兵器は戦争を防いだのか、それとも別の形の危険を生んだのか？',
  '冷戦構造':             '大国の対立は、なぜ遠く離れた小国の内戦として戦われた？',
  '植民地解放':           '独立を勝ち取った後、なぜ多くの国で新たな苦難が始まった？',
  '民族浄化':             '隣人同士だった人々が、なぜ殺し合うようになった？その転換点はどこ？',
  '権力真空':             '強い支配者が消えた後の「空白」は、なぜ平和ではなく混乱を生む？',
  '誤算・誤認知':         '開戦を決めた指導者は何を読み違えた？正しい情報があれば違ったと思う？',
  '指導者個人要因':       'もし指導者が別の人物だったら、歴史は変わっていた？それとも構造は同じ結果を生んだ？',
};
const THINK_FALLBACK = 'この戦争と同じ条件が今の世界のどこかに揃いつつあるとしたら、どこだと思う？';

function ThinkPrompt({ war, content }: { war: War; content: TabContent }) {
  const [open, setOpen] = useState(false);
  const tag = (war.tags ?? []).find(t => THINK_TEMPLATES[t]);
  const question = tag ? THINK_TEMPLATES[tag]! : THINK_FALLBACK;
  const hint = firstSentence(content.structure?.summary, 120);
  return (
    <div className="mt-5 rounded-lg overflow-hidden" style={{ border: '1px dashed #a78bfa', background: '#faf5ff' }}>
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: 13 }}>🤔</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6d28d9', letterSpacing: '0.06em' }}>
            考えてみよう{tag ? `（${tag}）` : ''}
          </span>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.7, color: '#4c1d95', fontWeight: 500 }}>{question}</p>
        {hint && (
          <button onClick={() => setOpen(!open)}
            style={{
              marginTop: 8, fontSize: 10, color: '#7c3aed', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
            }}>
            {open ? '▲ ヒントを閉じる' : '▼ 考えるヒントを見る'}
          </button>
        )}
        {open && hint && (
          <p style={{ marginTop: 6, fontSize: 11, lineHeight: 1.6, color: '#5b21b6', padding: '8px 10px', background: '#ede9fe', borderRadius: 6 }}>
            💡 {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 前提知識・次に読むナビ（足場かけ） ── */
function RelatedWarsNav({ war }: { war: War }) {
  const resolve = (ids: string[] | undefined) =>
    (ids ?? []).map(id => WARS.find(w => w.id === id)).filter((w): w is War => !!w);
  const causes = resolve(war.causes);
  const influences = resolve(war.influences);
  if (causes.length === 0 && influences.length === 0) return null;

  const Chip = ({ w, color }: { w: War; color: string }) => (
    <a href={`/explore?war=${w.id}`}
      style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 5,
        padding: '4px 10px', borderRadius: 14, fontSize: 10, fontWeight: 600,
        background: 'white', color, border: `1px solid ${color}50`,
        textDecoration: 'none', whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
      {w.name}
      <span style={{ fontSize: 8, opacity: 0.65, fontWeight: 400 }}>{w.year}</span>
    </a>
  );

  return (
    <div className="mt-4 rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      {causes.length > 0 && (
        <div className="mb-2.5">
          <div style={{ fontSize: 9, fontWeight: 700, color: '#0f766e', letterSpacing: '0.08em', marginBottom: 6 }}>
            📚 先に読むと理解が深まる（この戦争の原因となった戦争）
          </div>
          <div className="flex flex-wrap gap-1.5">
            {causes.map(w => <Chip key={w.id} w={w} color="#0f766e" />)}
          </div>
        </div>
      )}
      {influences.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9a3412', letterSpacing: '0.08em', marginBottom: 6 }}>
            ➡️ 次に読む（この戦争が引き起こした戦争）
          </div>
          <div className="flex flex-wrap gap-1.5">
            {influences.map(w => <Chip key={w.id} w={w} color="#9a3412" />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 深掘り資料パネル（深掘りモード専用） ── */
function DeepDivePanel({ war }: { war: War }) {
  const links = [
    { label: 'Wikipedia で調べる', url: `https://ja.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(war.name)}`, emoji: '📖' },
    { label: 'Google Scholar（学術論文）', url: `https://scholar.google.com/scholar?q=${encodeURIComponent(war.name)}`, emoji: '🎓' },
    { label: '国立国会図書館サーチ', url: `https://ndlsearch.ndl.go.jp/search?cs=bib&keyword=${encodeURIComponent(war.name)}`, emoji: '🏛️' },
  ];
  return (
    <div className="mt-4 rounded-lg overflow-hidden" style={{ border: '1px solid #334155' }}>
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: '#1e293b' }}>
        <span style={{ fontSize: 12 }}>🔬</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.06em' }}>深掘り資料</span>
      </div>
      <div className="p-3" style={{ background: '#f8fafc' }}>
        {(war.ideologies?.length ?? 0) > 0 && (
          <div className="mb-2.5">
            <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginRight: 8 }}>関連イデオロギー：</span>
            {war.ideologies!.map(i => (
              <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: '#e2e8f0', color: '#334155', marginRight: 5 }}>
                {i}
              </span>
            ))}
          </div>
        )}
        {(war.tags?.length ?? 0) > 0 && (
          <div className="mb-3">
            <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginRight: 8 }}>構造タグ：</span>
            {war.tags!.map(t => (
              <a key={t} href={`/search`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: '#fef3c7', color: '#92400e', marginRight: 5, textDecoration: 'none' }}>
                {t}
              </a>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {links.map(l => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                background: 'white', color: '#334155', border: '1px solid #cbd5e1',
                textDecoration: 'none',
              }}>
              {l.emoji} {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 音声ナレーターボタン ── */
function NarratorButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  const handleClick = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const plain = text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');
    const utter = new SpeechSynthesisUtterance(plain);
    utter.lang = 'ja-JP';
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  }, [text, speaking]);

  return (
    <button
      onClick={handleClick}
      title={speaking ? '読み上げを停止' : '音声で読み上げ'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
        background: speaking ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.1)',
        color: speaking ? '#4ade80' : '#94a3b8',
        border: `1px solid ${speaking ? 'rgba(74,222,128,0.4)' : 'rgba(148,163,184,0.2)'}`,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      {speaking ? '⏹' : '🔊'}
    </button>
  );
}

/* ── Claudeに質問ボタン ── */
function AskClaudeButton({ war }: { war: War }) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    const template = `「${war.name}」（${war.year}年〜${war.endYear}年、${war.theater}）について質問します。\n質問：`;
    try { await navigator.clipboard.writeText(template); } catch { /* 続行 */ }
    setCopied(true);
    setTimeout(() => window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer'), 1200);
    setTimeout(() => setCopied(false), 4000);
  }, [war]);

  return (
    <button
      onClick={handleClick}
      title="質問テンプレートをコピーしてClaudeを開く"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
        background: copied ? '#cc785c' : 'rgba(204,120,92,0.15)',
        color: copied ? '#fff' : '#cc785c',
        border: `1px solid ${copied ? '#cc785c' : 'rgba(204,120,92,0.45)'}`,
        cursor: 'pointer', letterSpacing: '0.03em',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <ClaudeIcon size={12} />
      {copied ? '✅ コピー済み→Claude開く' : 'Claudeに質問'}
    </button>
  );
}

export default function DetailDrawer({ war, isOpen, onClose, content, isLoading, drawerHeight, onResizeStart, isMobile = false, fullscreen = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('digest');
  const [mode, setMode] = useState<LearnMode>('standard');

  // 学習モードをlocalStorageから復元
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('wc-learning-mode') : null;
    if (saved === 'beginner' || saved === 'standard' || saved === 'deep') setMode(saved);
  }, []);

  const changeMode = useCallback((m: LearnMode) => {
    setMode(m);
    try { localStorage.setItem('wc-learning-mode', m); } catch { /* 続行 */ }
    if (m === 'beginner' && !BEGINNER_TABS.includes(activeTab)) setActiveTab('digest');
  }, [activeTab]);

  const visibleTabs = mode === 'beginner' ? TABS.filter(t => BEGINNER_TABS.includes(t.id)) : TABS;
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
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                {content && <NarratorButton text={content.digest?.background ?? ''} />}
                <AskClaudeButton war={war} />
                <button onClick={onClose}
                  style={{
                    fontSize: 12, padding: '6px 12px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.08)', color: '#f0d5c8',
                    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                    letterSpacing: '0.04em', flexShrink: 0,
                  }}>
                  ✕ 閉じる
                </button>
              </div>
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {content && <NarratorButton text={content.digest?.background ?? ''} />}
              <AskClaudeButton war={war} />
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
          {/* 学習モード切替（認知負荷理論：初学者は表示量を絞る） */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            padding: '0 8px', borderRight: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}>
            {MODE_OPTIONS.map(m => (
              <button key={m.id} onClick={() => changeMode(m.id)} title={m.title}
                style={{
                  padding: isMobile ? '6px 8px' : '4px 8px',
                  fontSize: 9, fontWeight: mode === m.id ? 700 : 400,
                  cursor: 'pointer', borderRadius: 3,
                  background: mode === m.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: mode === m.id ? '#fff' : '#7a6e5c',
                  border: mode === m.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  transition: 'all 0.15s',
                }}>
                <span>{m.emoji}</span>{m.label}
              </button>
            ))}
          </div>
          {visibleTabs.map((t) => {
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
            {/* 30秒でつかむ：読む前の全体像（先行オーガナイザー） */}
            {activeTab === 'digest' && (
              <QuickGrasp content={content} lessons={LESSONS[war.id] ?? content.lessons} />
            )}
            {activeTab === 'digest'       && <DigestTab       data={content.digest} />}
            {activeTab === 'detail'       && <DetailTab       data={content.detail} />}
            {activeTab === 'perspectives' && <PerspectivesTab data={content.perspectives} />}
            {activeTab === 'structure'    && <StructureTab    data={content.structure} />}
            {activeTab === 'legacy'       && <LegacyTab       data={content.legacy} />}
            {activeTab === 'human'        && <HumanTab        data={HUMAN_LAYERS[war.id] ?? content.human} />}
            {activeTab === 'lessons'      && <LessonsTab      data={LESSONS[war.id] ?? content.lessons} />}

            {/* 考えてみよう：精緻化質問（ダイジェスト・構造・教訓タブで表示） */}
            {(activeTab === 'digest' || activeTab === 'structure' || activeTab === 'lessons') && (
              <ThinkPrompt war={war} content={content} />
            )}

            {/* 前提知識・次に読むナビ（足場かけ） */}
            <RelatedWarsNav war={war} />

            {/* 深掘りモード専用：外部資料パネル */}
            {mode === 'deep' && <DeepDivePanel war={war} />}

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
