/** ナビゲーション定義（クライアントから読むので、重いデータは import しないこと） */

export interface NavItem {
  label: string;
  href: string;
  desc: string;
}
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'read',
    label: '読む',
    items: [
      { label: '通史', href: '/chronicle', desc: '6つの幕で戦争史の背骨をつかむ' },
      { label: '学習パス', href: '/learn', desc: 'テーマ別のおすすめの読み順' },
      { label: '現代の問い', href: '/themes', desc: '「なぜ今こうなのか」から歴史へ' },
      { label: '宗教から読む', href: '/religions', desc: '主要5宗教と戦争の関係' },
    ],
  },
  {
    id: 'find',
    label: '探す',
    items: [
      { label: '年表・地図', href: '/explore', desc: '時代と地域で戦争を俯瞰する' },
      { label: '戦争一覧', href: '/wars', desc: '全戦争を絞り込み・並べ替え' },
      { label: '全文検索', href: '/search', desc: 'キーワードで本文を横断検索' },
    ],
  },
  {
    id: 'analyze',
    label: '構造を見る',
    items: [
      { label: 'パターン進化', href: '/patterns', desc: '同じ構造が時代を越えて繰り返す' },
      { label: '因果の大河', href: '/chains', desc: '戦争が次の戦争を生む連鎖' },
      { label: '教訓', href: '/lessons', desc: '全戦争の教訓を横断して読む' },
    ],
  },
  {
    id: 'practice',
    label: '試す',
    items: [
      { label: 'フラッシュカード', href: '/flashcards', desc: '思い出して覚える復習モード' },
      { label: 'AIパターン診断', href: '/diagnose', desc: '今の出来事を過去の戦争と照合' },
      { label: '構造リスク診断', href: '/risk-check', desc: 'チェックリストで危機の兆候を見る' },
      { label: 'わんたの解説', href: '/wanta', desc: 'ナビ犬わんたのひとこと解説集' },
    ],
  },
  {
    id: 'now',
    label: 'いま',
    items: [
      { label: '進行中の戦争', href: '/live', desc: '現在続いている武力紛争の状況' },
    ],
  },
];
