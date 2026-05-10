'use client';

import { useEffect, useState } from 'react';

/**
 * 画面幅でモバイル判定するhook
 * SSR時は false（PC前提）→ クライアント側で再評価
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= breakpoint);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);

  return isMobile;
}
