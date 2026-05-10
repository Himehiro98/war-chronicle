'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Timeline from '@/components/Timeline';
import MapPanel from '@/components/MapPanel';
import DetailDrawer from '@/components/DetailDrawer';
import SearchModal from '@/components/SearchModal';
import CompareModal from '@/components/CompareModal';
import { War, EraId } from '@/lib/types';
import { ERA_CONFIG, WARS } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';
import { useIsMobile } from '@/lib/useIsMobile';

const ERA_ORDER: EraId[] = ['prehistoric', 'ancient', 'medieval', 'renaissance', 'early-modern', '20th-century', 'contemporary'];
const REGIONS = ['全て', '欧州', 'アジア', '中東・アフリカ', '南北米'];

export default function Home() {
  const [selectedWar, setSelectedWar] = useState<War | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [activeEra, setActiveEra]     = useState<EraId>('20th-century');
  const [activeRegion, setActiveRegion] = useState('全て');

  // モーダル
  const [searchOpen, setSearchOpen]   = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  // リサイズ状態
  const [timelineWidth, setTimelineWidth] = useState(50); // %
  const [drawerHeight, setDrawerHeight]   = useState(75); // % of main area

  // モバイル: 年表/地図のトグル
  const isMobile = useIsMobile(768);
  const [mobileView, setMobileView] = useState<'timeline' | 'map'>('timeline');

  const mainRef       = useRef<HTMLDivElement>(null);
  const horizResizing = useRef(false);
  const vertResizing  = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (horizResizing.current && mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect();
        const pct  = ((e.clientX - rect.left) / rect.width) * 100;
        setTimelineWidth(Math.max(20, Math.min(80, pct)));
      }
      if (vertResizing.current && mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect();
        const pct  = ((rect.bottom - e.clientY) / rect.height) * 100;
        setDrawerHeight(Math.max(20, Math.min(88, pct)));
      }
    };
    const onUp = () => {
      horizResizing.current = false;
      vertResizing.current  = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleHorizDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    horizResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleVertDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    vertResizing.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleSelectWar = useCallback((war: War) => {
    setSelectedWar(war);
    setDrawerOpen(true);
    setActiveEra(war.era);
  }, []);

  // ?war=xxx のクエリで初期選択（client-side のみ）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const warId = params.get('war');
    if (warId) {
      const w = WARS.find((x) => x.id === warId);
      if (w) handleSelectWar(w);
    }
  }, [handleSelectWar]);

  const content = selectedWar ? (WAR_CONTENT[selectedWar.id] ?? null) : null;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#f1f5f9', minHeight: 600 }}>

      {/* ── ヘッダー ── */}
      <header className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        style={{ background: '#0f172a', borderBottom: '2px solid #1e40af' }}>
        <div className="flex items-baseline gap-2.5">
          <Link href="/" style={{
            fontSize: 11, color: '#94a3b8', textDecoration: 'none',
            padding: '4px 8px', borderRadius: 3, marginRight: 8,
            border: '1px solid rgba(148,163,184,0.2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = 'rgba(248,250,252,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'; }}>
            ← ホーム
          </Link>
          <span className="font-serif" style={{ fontSize: 18, color: '#f8fafc', letterSpacing: '0.03em' }}>
            War Chronicle
          </span>
          <span style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.1em' }}>
            探索モード
          </span>
        </div>
        <nav className="flex gap-1.5">
          {[
            { label: '年表',  emoji: '📅', active: true,  onClick: () => {} },
            { label: '比較',  emoji: '⚖️', active: false, onClick: () => setCompareOpen(true) },
            { label: '検索',  emoji: '🔍', active: false, onClick: () => setSearchOpen(true) },
          ].map(({ label, emoji, active, onClick }) => (
            <button key={label} onClick={onClick} style={{
              padding: '4px 12px', borderRadius: 3, fontSize: 11,
              fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', gap: 4,
              border: active ? '1px solid #1e40af' : '1px solid rgba(148,163,184,0.2)',
              background: active ? '#1e40af' : 'transparent',
              color: active ? 'white' : '#cbd5e1',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: 11 }}>{emoji}</span>
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
      <main ref={mainRef} className="flex flex-1 overflow-hidden relative">
        {/* PC: 年表＋ハンドル＋地図 横並び */}
        {!isMobile && (
          <>
            <Timeline
              selectedId={selectedWar?.id ?? null}
              onSelect={handleSelectWar}
              activeEra={activeEra}
              activeRegion={activeRegion}
              width={timelineWidth}
            />
            <div
              onMouseDown={handleHorizDown}
              title="ドラッグで幅調整"
              style={{
                width: 8, flexShrink: 0, cursor: 'col-resize',
                background: 'rgba(42,34,24,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 5, transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,58,30,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(42,34,24,0.12)')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(42,34,24,0.5)' }} />
                ))}
              </div>
            </div>
            <MapPanel selectedWar={selectedWar} />
          </>
        )}

        {/* モバイル: 年表/地図 切替表示 */}
        {isMobile && mobileView === 'timeline' && (
          <Timeline
            selectedId={selectedWar?.id ?? null}
            onSelect={handleSelectWar}
            activeEra={activeEra}
            activeRegion={activeRegion}
            width={100}
          />
        )}
        {isMobile && mobileView === 'map' && (
          <MapPanel selectedWar={selectedWar} />
        )}

        {/* モバイル: 切替FABボタン */}
        {isMobile && (
          <button
            onClick={() => setMobileView(v => v === 'timeline' ? 'map' : 'timeline')}
            style={{
              position: 'absolute',
              bottom: drawerOpen ? 16 : 20,
              right: 16,
              zIndex: 20,
              width: 56, height: 56, borderRadius: 28,
              background: '#1e40af',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
              fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            aria-label={mobileView === 'timeline' ? '地図を見る' : '年表に戻る'}
          >
            {mobileView === 'timeline' ? '🗺️' : '📅'}
          </button>
        )}

        {/* 詳細ドロワー */}
        <DetailDrawer
          war={selectedWar}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          content={content}
          isLoading={false}
          drawerHeight={isMobile ? 100 : drawerHeight}
          onResizeStart={handleVertDown}
          isMobile={isMobile}
        />
      </main>

      {/* ── モーダル ── */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(war) => { handleSelectWar(war); setSearchOpen(false); }}
      />
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}
