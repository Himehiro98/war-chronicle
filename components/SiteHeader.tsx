'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV_GROUPS } from '@/lib/nav';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // ページ遷移で閉じる
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  // 外側クリック・Escで閉じる
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // モバイルメニュー表示中は背面スクロールを止める
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label="War Chronicle ホーム">
          <span className="site-logo__mark" aria-hidden>WC</span>
          <span className="site-logo__text">War Chronicle</span>
        </Link>

        <nav ref={navRef} className="site-nav" aria-label="メインメニュー">
          {NAV_GROUPS.map((g) => {
            const groupActive = g.items.some((i) => isActive(pathname, i.href));
            const open = openGroup === g.id;
            return (
              <div
                key={g.id}
                className="site-nav__group"
                onMouseEnter={() => setOpenGroup(g.id)}
                onMouseLeave={() => setOpenGroup((cur) => (cur === g.id ? null : cur))}
              >
                <button
                  type="button"
                  className={`site-nav__trigger${groupActive ? ' is-active' : ''}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(open ? null : g.id)}
                >
                  {g.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                    <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
                {open && (
                  <div className="site-nav__panel" role="menu">
                    {g.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`site-nav__item${isActive(pathname, item.href) ? ' is-current' : ''}`}
                      >
                        <span className="site-nav__item-label">{item.label}</span>
                        <span className="site-nav__item-desc">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <Link href="/search" className="icon-btn" aria-label="全文検索">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            type="button"
            className="icon-btn site-menu-btn"
            aria-label={mobileOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <Link href="/" className={`mobile-menu__home${pathname === '/' ? ' is-current' : ''}`}>ホーム</Link>
          {NAV_GROUPS.map((g) => (
            <section key={g.id} className="mobile-menu__group">
              <h2 className="mobile-menu__heading">{g.label}</h2>
              <ul>
                {g.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`mobile-menu__item${isActive(pathname, item.href) ? ' is-current' : ''}`}
                    >
                      <span className="mobile-menu__label">{item.label}</span>
                      <span className="mobile-menu__desc">{item.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </header>
  );
}
