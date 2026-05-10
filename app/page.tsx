'use client';

import { useState, useCallback } from 'react';
import Timeline from '@/components/Timeline';
import MapPanel from '@/components/MapPanel';
import DetailDrawer from '@/components/DetailDrawer';
import { War, EraId } from '@/lib/types';
import { ERA_CONFIG } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';

const ERA_ORDER: EraId[] = ['early-modern', '20th-century', 'contemporary'];
const REGIONS = ['全て', '欧州', 'アジア', '中東・アフリカ', '南北米'];

export default function Home() {
  const [selectedWar, setSelectedWar] = useState<War | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [activeEra, setActiveEra]     = useState<EraId>('early-modern');
  const [activeRegion, setActiveRegion] = useState('全て');

  const handleSelectWar = useCallback((war: War) => {
    setSelectedWar(war);
    setDrawerOpen(true);
  }, []);

  const content = selectedWar ? (WAR_CONTENT[selectedWar.id] ?? null) : null;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#f5f0e8', minHeight: 600 }}>

      {/* ── ヘッダー ── */}
      <header className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        style={{ background: '#2a2218', borderBottom: '2px solid #8b3a1e' }}>
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-parch" style={{ fontSize: 18, letterSpacing: '0.03em' }}>
            War Chronicle
          </span>
          <span style={{ fontSize: 10, color: '#9a8f7a', letterSpacing: '0.1em' }}>
            多角的戦争史データベース
          </span>
        </div>
        <nav className="flex gap-1.5">
          {['年表', '地図', '比較', '検索'].map((label) => (
            <button key={label} style={{
              padding: '4px 12px', borderRadius: 3, fontSize: 11,
              fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.05em',
              border: label === '年表' ? '1px solid #8b3a1e' : '1px solid rgba(245,240,232,0.2)',
              background: label === '年表' ? '#8b3a1e' : 'transparent',
              color: label === '年表' ? 'white' : '#c8bfb0',
            }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── ツールバー ── */}
      <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ background: '#ede6d6', borderBottom: '1px solid rgba(42,34,24,0.15)' }}>
        <span className="text-ink-light"
          style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>時代</span>
        <div className="flex gap-1">
          {ERA_ORDER.map((era) => (
            <button key={era} onClick={() => { setActiveEra(era); setSelectedWar(null); setDrawerOpen(false); }}
              style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
                border: `1px solid ${activeEra === era ? '#8b3a1e' : 'rgba(42,34,24,0.3)'}`,
                background: activeEra === era ? '#8b3a1e' : 'transparent',
                color: activeEra === era ? 'white' : '#4a3f30',
              }}>
              {ERA_CONFIG[era].label}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(42,34,24,0.15)' }} />
        <span className="text-ink-light"
          style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>地域</span>
        <div className="flex gap-1 flex-wrap">
          {REGIONS.map((region) => (
            <button key={region} onClick={() => setActiveRegion(region)} style={{
              padding: '3px 8px', borderRadius: 3, fontSize: 10, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              border: `1px solid ${activeRegion === region ? '#1a4a42' : 'rgba(42,34,24,0.15)'}`,
              background: activeRegion === region ? '#1a4a42' : 'transparent',
              color: activeRegion === region ? 'white' : '#7a6e5c',
            }}>
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* ── メイン ── */}
      <main className="flex flex-1 overflow-hidden relative">
        <Timeline selectedId={selectedWar?.id ?? null} onSelect={handleSelectWar} activeEra={activeEra} activeRegion={activeRegion} />
        <MapPanel selectedWar={selectedWar} />
        <DetailDrawer
          war={selectedWar}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          content={content}
          isLoading={false}
        />
      </main>
    </div>
  );
}
