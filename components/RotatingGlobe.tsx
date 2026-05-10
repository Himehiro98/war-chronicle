'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { WARS } from '@/lib/wars';

// react-globe.gl は WebGL/Three.js ベースなので動的インポートで SSR を回避
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface PointData {
  lat: number;
  lng: number;
  label: string;
  year: number;
  weight: number;
  region: number;
}

const REGION_COLORS: Record<number, string> = {
  0: '#fbbf24', // 欧州: amber
  1: '#06b6d4', // アジア: cyan
  2: '#f97316', // 中東・アフリカ: orange
  3: '#a78bfa', // 南北米: violet
};

interface Props {
  size?: number;
}

export default function RotatingGlobe({ size = 480 }: Props) {
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready || !globeRef.current) return;
    const controls = globeRef.current.controls();
    if (!controls) return;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;
    controls.enablePan = false;
    // 初期視点：欧州・アフリカが見える角度
    globeRef.current.pointOfView({ lat: 25, lng: 15, altitude: 2.2 }, 0);
  }, [ready]);

  // 戦争マーカー（主要マーカーのみ、重みでサイズ・色付け）
  const pointsData: PointData[] = WARS.flatMap((w) =>
    (w.markers ?? [])
      .filter((m) => m.isMain)
      .map((m) => ({
        lat: m.coordinates[1],
        lng: m.coordinates[0],
        label: w.name,
        year: w.year,
        weight: w.weight ?? 1,
        region: w.region,
      })),
  );

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
          atmosphereColor="#60a5fa"
          atmosphereAltitude={0.18}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={pointsData}
          pointAltitude={0.01}
          pointRadius={(d: any) => 0.25 + d.weight * 0.18}
          pointColor={(d: any) => REGION_COLORS[d.region] ?? '#fbbf24'}
          pointResolution={6}
          pointsMerge={false}
          pointLabel={(d: any) =>
            `<div style="background:rgba(15,23,42,0.95);color:#f8fafc;padding:8px 12px;border-radius:6px;font-size:11px;font-family:serif;border:1px solid rgba(251,191,36,0.4);box-shadow:0 4px 12px rgba(0,0,0,0.4)">
              <div style="font-weight:700;margin-bottom:2px">${d.label}</div>
              <div style="font-size:9px;color:#94a3b8;letter-spacing:0.05em">${d.year}年</div>
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
    </div>
  );
}
