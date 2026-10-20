'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WARS, REGIONS, ERA_CONFIG } from '@/lib/wars';
import type { EraId, War } from '@/lib/types';
import { formatPeriod } from '@/lib/text';
import { useIsMobile } from '@/lib/useIsMobile';
import Timeline from './Timeline';
import MapPanel from '@/components/MapPanel';

const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];
export const ERA_SHORT: Record<EraId, string> = {
  prehistoric: '先史・古代文明',
  ancient: '古代',
  medieval: '中世',
  renaissance: '近世前期',
  'early-modern': '近世・近代',
  '20th-century': '20世紀',
  contemporary: '21世紀',
};
const TYPE_LABEL: Record<string, string> = { war: '戦争', revolution: '革命・内戦', colonial: '植民地戦争' };

export default function ExploreView({ summaries }: { summaries: Record<string, string> }) {
  const params = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile(768);

  const initialEra = (params.get('era') as EraId) || '20th-century';
  const [era, setEra] = useState<EraId>(ERA_ORDER.includes(initialEra) ? initialEra : '20th-century');
  const [region, setRegion] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<War | null>(null);
  const [mobileView, setMobileView] = useState<'timeline' | 'map'>('timeline');

  // URL に時代を反映（共有・戻る対応）
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('era', era);
    window.history.replaceState(null, '', url.toString());
  }, [era]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const w of WARS) c[w.era] = (c[w.era] ?? 0) + 1;
    return c;
  }, []);

  const q = query.trim();
  const visible = useMemo(() => {
    return WARS.filter((w) => {
      if (q) {
        if (!(w.name.includes(q) || w.theater.includes(q))) return false;
      } else if (w.era !== era) return false;
      if (region !== null && w.region !== region) return false;
      return true;
    });
  }, [q, era, region]);

  const select = (w: War) => {
    if (selected?.id === w.id) {
      router.push(`/wars/${w.id}`);
      return;
    }
    setSelected(w);
  };

  return (
    <div className="explore" style={{ height: 'calc(100dvh - var(--header-h))' }}>
      {/* ── ツールバー ── */}
      <div className="explore-toolbar">
        <div className="explore-toolbar__row">
          <div className="explore-toolbar__group" role="group" aria-label="時代">
            {ERA_ORDER.map((e) => (
              <button
                key={e}
                type="button"
                className="chip"
                aria-pressed={!q && era === e}
                title={ERA_CONFIG[e].label}
                onClick={() => { setEra(e); setQuery(''); setSelected(null); }}
              >
                {ERA_SHORT[e]}<span className="count">{counts[e] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="explore-toolbar__row">
          <div className="explore-toolbar__group" role="group" aria-label="地域">
            <button type="button" className="chip" aria-pressed={region === null} onClick={() => setRegion(null)}>すべての地域</button>
            {REGIONS.map((r, i) => (
              <button key={r} type="button" className="chip" aria-pressed={region === i} onClick={() => setRegion(region === i ? null : i)}>
                {r}
              </button>
            ))}
          </div>
          <label className="explore-search">
            <span className="sr-only">戦争名で探す</span>
            <input
              className="input"
              type="search"
              placeholder="戦争名・地域名で探す（全時代）"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            />
          </label>
        </div>
      </div>

      {isMobile && (
        <div className="explore-switch" role="tablist" aria-label="表示切り替え">
          <button role="tab" aria-selected={mobileView === 'timeline'} onClick={() => setMobileView('timeline')}>年表</button>
          <button role="tab" aria-selected={mobileView === 'map'} onClick={() => setMobileView('map')}>地図</button>
        </div>
      )}

      {/* ── 本体 ── */}
      <div className="explore-main">
        {(!isMobile || mobileView === 'timeline') && (
          <div className="explore-timeline">
            <Timeline wars={visible} selectedId={selected?.id ?? null} onSelect={select} compact={isMobile} searching={!!q} />
          </div>
        )}
        {(!isMobile || mobileView === 'map') && (
          <div className="explore-side">
            <MapPanel selectedWar={selected} />
            {!isMobile && <Preview war={selected} summary={selected ? summaries[selected.id] : undefined} />}
          </div>
        )}
      </div>

      {isMobile && selected && (
        <div className="explore-sheet" role="dialog" aria-label={`${selected.name}の概要`}>
          <button className="explore-sheet__close" aria-label="閉じる" onClick={() => setSelected(null)}>×</button>
          <Preview war={selected} summary={summaries[selected.id]} />
        </div>
      )}
    </div>
  );
}

function Preview({ war, summary }: { war: War | null; summary?: string }) {
  if (!war) {
    return (
      <div className="explore-preview explore-preview--empty">
        <p>年表から戦争を選ぶと、ここに概要が表示されます。</p>
        <p className="muted">もう一度クリックすると詳しい解説ページを開きます。</p>
      </div>
    );
  }
  return (
    <div className="explore-preview">
      <div className="explore-preview__meta">
        {formatPeriod(war.year, war.endYear, war.ongoing)}・{REGIONS[war.region]}・{TYPE_LABEL[war.type]}
      </div>
      <h2 className="explore-preview__title">{war.name}</h2>
      <div className="explore-preview__theater">{war.theater}</div>
      {summary && <p className="explore-preview__summary">{summary}</p>}
      {war.tags && (
        <div className="explore-preview__tags">
          {war.tags.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      <Link href={`/wars/${war.id}`} className="btn btn--accent">この戦争を詳しく読む →</Link>
    </div>
  );
}
