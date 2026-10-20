'use client';

import { useEffect, useRef, useState } from 'react';

export interface WarTab {
  id: string;
  label: string;
}

/**
 * タブ切り替え。パネル本体はサーバーで描画済みの children を受け取り、
 * 表示/非表示だけを切り替える（全文がHTMLに含まれるので検索・共有に強い）。
 * URLハッシュ（#lessons など）と同期する。
 */
export default function WarTabs({ tabs, panels }: { tabs: WarTab[]; panels: Record<string, React.ReactNode> }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const barRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '');
      if (tabs.some((t) => t.id === h)) setActive(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);

  // アクティブなタブをタブバー内で見える位置にスクロール
  useEffect(() => {
    const el = barRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  const select = (id: string) => {
    setActive(id);
    history.replaceState(null, '', `#${id}`);
    // タブバーより下までスクロールしていたら、パネルの先頭に戻す
    requestAnimationFrame(() => {
      const top = topRef.current;
      if (!top) return;
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56;
      const y = top.getBoundingClientRect().top + window.scrollY - headerH;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') { e.preventDefault(); select(tabs[(i + 1) % tabs.length].id); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i - 1 + tabs.length) % tabs.length].id); }
  };

  return (
    <div ref={topRef} className="war-tabs">
      <div className="war-tabs__bar" role="tablist" aria-label="この戦争を読む視点" ref={barRef} onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            data-tab={t.id}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className="war-tabs__tab"
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="war-tabs__panel"
        >
          {panels[t.id]}
        </div>
      ))}
    </div>
  );
}
