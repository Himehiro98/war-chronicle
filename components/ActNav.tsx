'use client';

import { useEffect, useState } from 'react';

/** ページ内の章（data-section-id を持つ要素）に追従する目次。sticky で使う */
export default function ActNav({ items, label }: { items: { id: string; short: string; full: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="act-nav" aria-label={label}>
      <div className="container act-nav__inner">
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} className={`act-nav__item${active === i.id ? ' is-active' : ''}`} title={i.full}>
            {i.short}
          </a>
        ))}
      </div>
    </nav>
  );
}
