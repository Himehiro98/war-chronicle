'use client';

import { useEffect, useState } from 'react';
import RotatingGlobe from '@/components/RotatingGlobe';

/** 画面幅に合わせて地球儀のサイズを決める（WebGLはCSSで伸縮できないため） */
export default function HeroGlobe() {
  const [size, setSize] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setSize(w < 768 ? Math.min(w - 32, 360) : w < 1100 ? 400 : 480);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  if (!size) return <div className="hero-globe__placeholder" aria-hidden />;
  return (
    <div className="hero-globe">
      <RotatingGlobe size={size} />
      <p className="hero-globe__caption">主な戦場をクリックすると概要が出ます（ドラッグで回転）</p>
    </div>
  );
}
