'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS } from '@/lib/nav';

/** 全画面アプリ型のページ（年表・地図）ではフッターを出さない */
const HIDE_ON = ['/explore'];

export default function SiteFooter({ warCount, yearRange }: { warCount: number; yearRange: string }) {
  const pathname = usePathname() ?? '/';
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__about">
          <div className="site-footer__brand">
            <img src="/wanta.png" alt="" width={48} height={48} className="site-footer__wanta" />
            <div>
              <div className="site-footer__name">War Chronicle</div>
              <div className="site-footer__sub">{yearRange}・{warCount}の戦争を横断する歴史学習サイト</div>
            </div>
          </div>
          <p>
            戦争を英雄譚としてではなく、安全保障・ナショナリズム・経済・情報・集団心理が交差する出来事として読み解きます。
            当事国・市民・国際社会・後世の評価など複数の視点を並べ、単純な善悪では語りません。
          </p>
          <p className="site-footer__note">
            本文は公開資料をもとに編集したもので、数値や評価には諸説があります。学習の入口としてご利用ください。
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="サイトマップ">
          {NAV_GROUPS.map((g) => (
            <div key={g.id}>
              <div className="site-footer__heading">{g.label}</div>
              <ul>
                {g.items.map((i) => (
                  <li key={i.href}><Link href={i.href}>{i.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="site-footer__bottom">
        <span>© War Chronicle</span>
        <span>戦争は突然起きない。人類は似た条件で何度も衝突してきた。</span>
      </div>
    </footer>
  );
}
