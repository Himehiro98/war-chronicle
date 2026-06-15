/**
 * 現在進行中の武力紛争 — ライブデータ
 * 最終更新: 2026-06-09
 *
 * データソース:
 *   - ACLED (Armed Conflict Location & Event Data): acleddata.com
 *   - UNHCR: unhcr.org/refugee-statistics
 *   - OCHA: unocha.org/global-humanitarian-overview
 *   - WFP: wfp.org/global-hunger-monitoring
 */

export interface LiveConflictStats {
  id: string;               // war chronicle の war ID に対応
  name: string;
  startDate: string;        // ISO date
  status: 'active' | 'ceasefire' | 'frozen';
  phase: string;            // 現在の段階
  // 死者
  deathsTotal: string;      // 累計死者（推計）
  deathsSource: string;
  deathsAsOf: string;       // この数字の基準日
  // 避難
  idps: string;             // 国内避難民
  refugees: string;         // 国外難民
  displacedSource: string;
  // 食料・人道
  hungerAffected: string;   // 食料不安人口
  needHumanitarian: string; // 人道支援必要人口
  humanitarianSource: string;
  // 最新動向
  latestDevelopment: string;
  latestDate: string;
  // ソースリンク
  sources: { label: string; url: string }[];
  // アクセントカラー（UI用）
  accentColor: string;
  region: string;
}

export const LIVE_CONFLICTS: LiveConflictStats[] = [
  {
    id: 'ukraine-war',
    name: 'ロシア・ウクライナ戦争',
    startDate: '2022-02-24',
    status: 'active',
    phase: '全面侵攻フェーズ（3年目）',
    deathsTotal: '軍人推計18万〜35万人、民間人約12,000人超（確認済み）',
    deathsSource: 'OHCHR・ACLED（2025年推計）',
    deathsAsOf: '2025年12月',
    idps: '約370万人（ウクライナ国内）',
    refugees: '約640万人（欧州各国）',
    displacedSource: 'UNHCR 2025年',
    hungerAffected: '約1,400万人が食料支援必要',
    needHumanitarian: '約1,700万人',
    humanitarianSource: 'OCHA 2025年',
    latestDevelopment: '東部・南部での消耗戦が継続。F-16供与後も前線は膠着。停戦交渉は断続的に行われているが合意なし。',
    latestDate: '2025年',
    sources: [
      { label: 'UNHCR ウクライナ状況', url: 'https://www.unhcr.org/ukraine-emergency' },
      { label: 'OCHA ウクライナ', url: 'https://www.unocha.org/ukraine' },
      { label: 'OHCHR 民間人犠牲', url: 'https://ukraine.un.org/en/human-rights' },
    ],
    accentColor: '#3b82f6',
    region: '東欧',
  },
  {
    id: 'gaza-war',
    name: 'ガザ戦争',
    startDate: '2023-10-07',
    status: 'active',
    phase: 'イスラエル地上作戦継続中（2年目）',
    deathsTotal: 'パレスチナ人 約56,000人超（2025年末時点、ガザ保健省）',
    deathsSource: 'ガザ保健省・OCHA',
    deathsAsOf: '2025年12月',
    idps: 'ガザ全人口230万人の約90%が繰り返し避難',
    refugees: '国外脱出はエジプト経由で限定的',
    displacedSource: 'UNRWA 2025年',
    hungerAffected: '人口全体が食料不安（Famine IPC Phase 3〜5）',
    needHumanitarian: '230万人全員',
    humanitarianSource: 'IPC・WFP 2025年',
    latestDevelopment: '北部ガザで複数回の飢饉認定。人道支援搬入は断続的に制限。ICJによる暫定措置命令後も戦闘継続。',
    latestDate: '2025年',
    sources: [
      { label: 'UNRWA ガザ状況', url: 'https://www.unrwa.org/resources/reports' },
      { label: 'OCHA ガザ', url: 'https://www.unocha.org/middle-east' },
      { label: 'WFP ガザ食料危機', url: 'https://www.wfp.org/countries/palestine' },
    ],
    accentColor: '#dc2626',
    region: '中東',
  },
  {
    id: 'sudan-civil-war-2023',
    name: 'スーダン内戦（2023〜）',
    startDate: '2023-04-15',
    status: 'active',
    phase: '国軍（SAF）vs即応支援部隊（RSF）— 全土規模の戦闘',
    deathsTotal: '推計15万〜20万人以上（2024年末、ACLED）',
    deathsSource: 'ACLED・国連専門家パネル',
    deathsAsOf: '2025年',
    idps: '約1,100万人（世界最大規模のIDP）',
    refugees: '約250万人（チャド・南スーダン・エジプト）',
    displacedSource: 'UNHCR・IDMC 2025年',
    hungerAffected: '約2,500万人以上（人口の半数超）',
    needHumanitarian: '約3,000万人',
    humanitarianSource: 'OCHA 2025年',
    latestDevelopment: 'ダルフールのザムザムキャンプで飢饉（IPC Phase 5）認定継続。米国がRSFによるジェノサイドを認定（2025年初）。',
    latestDate: '2025年',
    sources: [
      { label: 'UNHCR スーダン', url: 'https://www.unhcr.org/emergencies/sudan-emergency' },
      { label: 'OCHA スーダン', url: 'https://www.unocha.org/sudan' },
      { label: 'WFP スーダン飢餓', url: 'https://www.wfp.org/countries/sudan' },
    ],
    accentColor: '#f59e0b',
    region: '東アフリカ',
  },
  {
    id: 'myanmar-civil-war',
    name: 'ミャンマー内戦',
    startDate: '2021-02-01',
    status: 'active',
    phase: '国軍 vs PDF（人民防衛軍）＋少数民族武装勢力',
    deathsTotal: '推計50,000人超（ACLED 2024年末）',
    deathsSource: 'ACLED・AAPP（ミャンマー政治犯支援協会）',
    deathsAsOf: '2025年',
    idps: '約330万人',
    refugees: '約150,000人（タイ・インド）',
    displacedSource: 'IDMC・UNHCR 2025年',
    hungerAffected: '約1,580万人',
    needHumanitarian: '約1,900万人',
    humanitarianSource: 'OCHA 2025年',
    latestDevelopment: '2023年からの「1027作戦」で少数民族武装勢力が複数の都市を制圧。国軍の統治能力が大きく低下。',
    latestDate: '2025年',
    sources: [
      { label: 'UNHCR ミャンマー', url: 'https://www.unhcr.org/countries/myanmar' },
      { label: 'OCHA ミャンマー', url: 'https://www.unocha.org/myanmar' },
      { label: 'AAPP 死者・拘束者統計', url: 'https://aappb.org' },
    ],
    accentColor: '#8b5cf6',
    region: '東南アジア',
  },
  {
    id: 'yemen-civil-war',
    name: 'イエメン内戦',
    startDate: '2015-03-26',
    status: 'active',
    phase: 'フーシ派 vs 国際承認政府＋サウジ連合軍（10年目）',
    deathsTotal: '死者推計37万7千人（直接・間接死合計、2021年UNDP推計）',
    deathsSource: 'UNDP・ACLED',
    deathsAsOf: '2025年（継続更新中）',
    idps: '約460万人',
    refugees: '約80,000人',
    displacedSource: 'UNHCR・IDMC 2025年',
    hungerAffected: '約1,750万人（深刻な食料不安）',
    needHumanitarian: '約2,140万人',
    humanitarianSource: 'OCHA 2025年',
    latestDevelopment: 'フーシ派が紅海でのイスラエル・西洋船舶攻撃を継続。米英による報復空爆。和平交渉はサウジ・イエメン間で断続的に進行。',
    latestDate: '2025年',
    sources: [
      { label: 'UNHCR イエメン', url: 'https://www.unhcr.org/countries/yemen' },
      { label: 'OCHA イエメン', url: 'https://www.unocha.org/yemen' },
      { label: 'WFP イエメン', url: 'https://www.wfp.org/countries/yemen' },
    ],
    accentColor: '#059669',
    region: '中東',
  },
  {
    id: 'syrian-civil-war',
    name: 'シリア内戦（ポスト・アサド）',
    startDate: '2011-03-15',
    status: 'ceasefire',
    phase: 'アサド政権崩壊後（2024年12月）の移行期',
    deathsTotal: '推計50万〜60万人（13年間の累計）',
    deathsSource: 'SOHR・国連',
    deathsAsOf: '2025年',
    idps: '約650万人（国内残留）',
    refugees: '約530万人（トルコ・レバノン・ヨルダン等）',
    displacedSource: 'UNHCR 2025年',
    hungerAffected: '約1,200万人',
    needHumanitarian: '約1,650万人',
    humanitarianSource: 'OCHA 2025年',
    latestDevelopment: '2024年12月にアサド政権崩壊。HTS（旧ヌスラ戦線系）主導の移行政権樹立。難民帰還が課題。ISILの残滅作戦継続。',
    latestDate: '2025年',
    sources: [
      { label: 'UNHCR シリア難民', url: 'https://www.unhcr.org/syria-emergency' },
      { label: 'OCHA シリア', url: 'https://www.unocha.org/syria' },
    ],
    accentColor: '#0891b2',
    region: '中東',
  },
];

export const LIVE_DATA_UPDATED = '2026-06-15';
export const LIVE_DATA_SOURCES = [
  { name: 'ACLED', url: 'https://acleddata.com', desc: '武力紛争の位置・事象データ' },
  { name: 'UNHCR', url: 'https://www.unhcr.org/refugee-statistics', desc: '難民・避難民統計' },
  { name: 'OCHA', url: 'https://www.unocha.org', desc: '国連人道問題調整事務所' },
  { name: 'WFP', url: 'https://www.wfp.org', desc: '世界食糧計画の飢餓モニタリング' },
  { name: 'IPC', url: 'https://www.ipcinfo.org', desc: '食料安全保障フェーズ分類' },
];
