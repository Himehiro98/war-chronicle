'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WARS } from '@/lib/wars';

// react-globe.gl は WebGL/Three.js ベースなので動的インポートで SSR を回避
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface PointData {
  lat: number;
  lng: number;
  label: string;
  year: number;
  endYear: number;
  weight: number;
  region: number;
  warId: string;
  era: string;
}

const REGION_COLORS: Record<number, string> = {
  0: '#fbbf24', // 欧州: amber
  1: '#06b6d4', // アジア: cyan
  2: '#f97316', // 中東・アフリカ: orange
  3: '#a78bfa', // 南北米: violet
};

const REGION_LABELS: Record<number, string> = {
  0: '欧州',
  1: 'アジア',
  2: '中東・アフリカ',
  3: '南北米',
};

interface Props {
  size?: number;
}

function formatYear(y: number): string {
  if (y < 0) return `紀元前${-y}年`;
  return `${y}年`;
}

export default function RotatingGlobe({ size = 600 }: Props) {
  const router = useRouter();
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<PointData | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready || !globeRef.current) return;
    const controls = globeRef.current.controls();
    if (!controls) return;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    globeRef.current.pointOfView({ lat: 25, lng: 15, altitude: 2.0 }, 0);
  }, [ready]);

  // 選択中は自動回転を止めて見やすく
  useEffect(() => {
    if (!ready || !globeRef.current) return;
    const controls = globeRef.current.controls();
    if (!controls) return;
    controls.autoRotate = !selected;
  }, [selected, ready]);

  // 戦争マーカー
  const pointsData: PointData[] = WARS.flatMap((w) =>
    (w.markers ?? [])
      .filter((m) => m.isMain)
      .map((m) => ({
        lat: m.coordinates[1],
        lng: m.coordinates[0],
        label: w.name,
        year: w.year,
        endYear: w.endYear,
        weight: w.weight ?? 1,
        region: w.region,
        warId: w.id,
        era: w.era,
      })),
  );

  const handlePointClick = useCallback((point: any) => {
    const p = point as PointData;
    if (!p?.warId) return;
    // 既選択 → そのまま詳細ページへ
    if (selected?.warId === p.warId) {
      router.push(`/explore?war=${p.warId}`);
      return;
    }
    // 未選択 → カードで情報表示（詳細はボタン押下で）
    setSelected(p);
    // マーカーを画面中央へ寄せる
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.6 }, 800);
    }
  }, [selected, router]);

  const closeCard = () => setSelected(null);

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      pointerEvents: 'auto',
    }}>
      {ready && (
        <Globe
          ref={globeRef}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#93c5fd"
          atmosphereAltitude={0.22}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={pointsData}
          pointAltitude={0.012}
          pointRadius={(d: any) => 0.32 + d.weight * 0.22}
          pointColor={(d: any) => REGION_COLORS[d.region] ?? '#fbbf24'}
          pointResolution={6}
          pointsMerge={false}
          onPointClick={handlePointClick}
          pointLabel={(d: any) =>
            `<div style="background:rgba(15,23,42,0.95);color:#f8fafc;padding:6px 10px;border-radius:6px;font-size:11px;font-family:serif;border:1px solid rgba(251,191,36,0.6);box-shadow:0 4px 12px rgba(0,0,0,0.4);pointer-events:none">
              <div style="font-weight:700">${d.label}</div>
              <div style="font-size:9px;color:#94a3b8;margin-top:2px">${d.year < 0 ? '紀元前' + (-d.year) + '年' : d.year + '年'}</div>
            </div>`
          }
        />
      )}

      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(248,250,252,0.4)', fontSize: 11,
        }}>
          地球を読み込み中…
        </div>
      )}

      {/* 選択時のフローティング情報カード（PC・スマホ両対応） */}
      {selected && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(8px)',
            border: `2px solid ${REGION_COLORS[selected.region] ?? '#fbbf24'}`,
            borderRadius: 10,
            padding: '14px 18px 14px 14px',
            minWidth: 240,
            maxWidth: 360,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            zIndex: 10,
            animation: 'globe-card-fade 0.25s ease',
          }}
        >
          {/* 閉じるボタン */}
          <button
            onClick={closeCard}
            style={{
              position: 'absolute',
              top: 6, right: 6,
              width: 24, height: 24,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, cursor: 'pointer',
              color: '#94a3b8', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="閉じる"
          >
            ✕
          </button>

          {/* 地域バッジ */}
          <div style={{
            display: 'inline-block',
            padding: '2px 7px',
            borderRadius: 3,
            background: `${REGION_COLORS[selected.region] ?? '#fbbf24'}30`,
            border: `1px solid ${REGION_COLORS[selected.region] ?? '#fbbf24'}60`,
            fontSize: 9,
            color: REGION_COLORS[selected.region] ?? '#fbbf24',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            {REGION_LABELS[selected.region] ?? '—'}
          </div>

          {/* 戦争名 */}
          <div className="font-serif" style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.35,
            marginBottom: 6,
            paddingRight: 28,
          }}>
            {selected.label}
          </div>

          {/* 年代 */}
          <div style={{
            fontSize: 11,
            color: '#cbd5e1',
            marginBottom: 12,
            letterSpacing: '0.04em',
          }}>
            {formatYear(selected.year)}
            {selected.endYear !== selected.year && (
              <> – {formatYear(selected.endYear)}</>
            )}
          </div>

          {/* 詳細ページへ */}
          <button
            onClick={() => router.push(`/explore?war=${selected.warId}`)}
            style={{
              width: '100%',
              padding: '8px 14px',
              background: '#fbbf24',
              color: '#0f172a',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fcd34d')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fbbf24')}
          >
            🔍 詳細ページへ →
          </button>
          <div style={{
            fontSize: 8,
            color: '#64748b',
            marginTop: 6,
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}>
            もう一度マーカーをタップしても遷移できます
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes globe-card-fade {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
