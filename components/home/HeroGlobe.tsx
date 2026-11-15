'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { PointData } from '@/components/RotatingGlobe';

// 地球儀（three.js / WebGL）は重いので、初期描画・ハイドレーションが落ち着いてから別チャンクを読み込む
const RotatingGlobe = dynamic(() => import('@/components/RotatingGlobe'), { ssr: false });

/** ページ読み込み完了後、ブラウザがアイドルになってから実行する（最長 timeout ms で強制実行） */
function whenIdle(cb: () => void, timeout: number): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    if (cancelled) return;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => !cancelled && cb(), { timeout });
    } else {
      timerId = setTimeout(() => !cancelled && cb(), 200);
    }
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    if (idleId !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
    if (timerId !== undefined) clearTimeout(timerId);
  };
}

/** 画面幅に合わせて地球儀のサイズを決める（WebGLはCSSで伸縮できないため） */
export default function HeroGlobe({ points }: { points: PointData[] }) {
  const [size, setSize] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setSize(w < 768 ? Math.min(w - 32, 360) : w < 1100 ? 400 : 480);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  useEffect(() => whenIdle(() => setActive(true), 3000), []);
  if (!size || !active) return <div className="hero-globe__placeholder" aria-hidden />;
  return (
    <div className="hero-globe">
      <RotatingGlobe size={size} points={points} />
      <p className="hero-globe__caption">主な戦場をクリックすると概要が出ます（ドラッグで回転）</p>
    </div>
  );
}
