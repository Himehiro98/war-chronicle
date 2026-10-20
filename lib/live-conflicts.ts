/**
 * 現在進行中の武力紛争 — 現況データ
 *
 * ⚠️ このファイルは人が内容を確認して更新する。日付だけを自動で書き換えないこと。
 *   数字ごとに「基準時点（asOf）」と出典を持たせ、古い数字は古いと分かるように表示する。
 *
 * 更新手順:
 *   1. 各紛争の数値・最新動向を国際機関や主要報道で確認して書き換える
 *   2. 書き換えた項目の asOf / latestDate を更新する
 *   3. LIVE_DATA_REVIEWED を確認した日付にする
 *   4. lib/content-updates-2026.ts（戦争ページ側の最新状況）も合わせて見直す
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
  deathsAsOf: string;       // この数字の基準時点
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
    phase: '全面侵攻5年目。東部ドネツク州を中心とした消耗戦と長距離攻撃の応酬',
    deathsTotal: '民間人の死者16,431人（OHCHR確認分。実数はさらに多いとされる）。両軍の死傷者は合計100万人超との推計も',
    deathsSource: '国連人権高等弁務官事務所（OHCHR）、CFR',
    deathsAsOf: '2026年6月末',
    idps: '約370万人（ウクライナ国内）',
    refugees: '約640万人（主に欧州）',
    displacedSource: 'UNHCR（2025年）',
    hungerAffected: '約1,400万人が食料支援を必要',
    needHumanitarian: '約1,700万人',
    humanitarianSource: 'OCHA（2025年）',
    latestDevelopment:
      'ロシアはウクライナ領の約2割を占領し、コスチャンティニウカやスロビャンスク〜クラマトルスク方面で漸進的に前進。2026年10月にも停戦をめぐる発表がある一方、ロシアはキーウ周辺の変電所など電力網への大規模攻撃を続け、ウクライナはロシアの製油所やサンクトペテルブルク周辺への長距離ドローン攻撃で応じている。米国主導の和平交渉は2025年から断続的に続くが、包括的な停戦には至っていない。',
    latestDate: '2026年10月',
    sources: [
      { label: 'CFR Global Conflict Tracker', url: 'https://www.cfr.org/global-conflict-tracker/conflict/conflict-ukraine' },
      { label: 'OHCHR 民間人被害', url: 'https://ukraine.un.org/en/human-rights' },
      { label: 'UNHCR ウクライナ', url: 'https://www.unhcr.org/ukraine-emergency' },
    ],
    accentColor: '#3b82f6',
    region: '東欧',
  },
  {
    id: 'iran-israel-war',
    name: '米国・イスラエルとイランの戦争',
    startDate: '2026-02-28',
    status: 'active',
    phase: '2026年2月の開戦から膠着。限定停戦案をめぐる駆け引きと散発的な攻撃',
    deathsTotal: 'イラン側3,375人以上の民間人（WHO）、イラン当局発表で3,528人。イスラエル・米国・湾岸諸国でも死者。レバノンでは4千人超',
    deathsSource: 'WHO、イラン当局、人権団体HRANA、各国政府（Wikipedia集計による）',
    deathsAsOf: '2026年9月頃',
    idps: 'レバノンで120万人以上が避難',
    refugees: '—（集計が定まっていない）',
    displacedSource: '国連・各種報道（2026年）',
    hungerAffected: '—',
    needHumanitarian: '—',
    humanitarianSource: '—',
    latestDevelopment:
      '2026年2月28日に米・イスラエルがイランを攻撃し、最高指導者ハメネイ師が死亡。イランはホルムズ海峡を封鎖した。4月の一時停戦、6月の戦争終結の覚書を経ても、7月の商船攻撃を機に戦闘が再開。10月時点では仲介による協議が続くものの合意はなく、イエメンのフーシ派によるサウジアラビアへの攻撃やバブ・エル・マンデブ海峡周辺の緊張など、周辺への波及が続いている。',
    latestDate: '2026年10月',
    sources: [
      { label: 'CNN（2026年10月19日）', url: 'https://www.cnn.com/2026/10/19/middleeast/iran-us-conflict-warning-intl' },
      { label: 'CNN 海上輸送への影響', url: 'https://www.cnn.com/2026/10/17/economy/us-iran-war-shipping-trade-hormuz-bab-el-mandab-strait-intl-vis' },
      { label: 'Wikipedia: 2026 Iran war（英語）', url: 'https://en.wikipedia.org/wiki/2026_Iran_war' },
    ],
    accentColor: '#7c3aed',
    region: '中東',
  },
  {
    id: 'gaza-war',
    name: 'ガザ戦争',
    startDate: '2023-10-07',
    status: 'ceasefire',
    phase: '2025年10月10日に停戦発効。ただしイスラエル軍がガザの約6割を支配し、攻撃が続く「名ばかりの停戦」',
    deathsTotal: 'パレスチナ人74,389人（2023年10月以降の累計、ガザ保健当局）。うち停戦後に約1,500人',
    deathsSource: 'ガザ保健当局（WAFA経由の報道）',
    deathsAsOf: '2026年10月13日',
    idps: '住民約210万人の大半が、残る約4割の地域に密集',
    refugees: '国外への脱出は限定的',
    displacedSource: '各種報道（2026年10月）',
    hungerAffected: '約140万人が深刻な食料不足（年末まで）',
    needHumanitarian: 'ほぼ全住民',
    humanitarianSource: 'Al Jazeera・人道団体（2026年10月）',
    latestDevelopment:
      '停戦から1年が経過したが、ハマスの武装解除、イスラエル軍の撤退、戦後統治をめぐる交渉は膠着。100を超える人道団体が「停戦は名ばかり」と声明を出した（2026年10月）。復興資金の拠出表明は相次いでいる。',
    latestDate: '2026年10月',
    sources: [
      { label: 'Amnesty（2026年10月）', url: 'https://www.amnesty.org/en/latest/news/2026/10/gaza-ceasefire-exists-in-name-only-say-more-than-100-organizations/' },
      { label: 'The New Humanitarian（2026年10月）', url: 'https://www.thenewhumanitarian.org/opinion/first-person/2026/10/15/there-no-ceasefire-here-ten-palestinians-life-gaza-today' },
      { label: 'OCHA パレスチナ', url: 'https://www.ochaopt.org' },
    ],
    accentColor: '#dc2626',
    region: '中東',
  },
  {
    id: 'sudan-civil-war-2023',
    name: 'スーダン内戦（2023〜）',
    startDate: '2023-04-15',
    status: 'active',
    phase: '国軍（SAF）と即応支援部隊（RSF）の全土規模の戦闘。ドローン攻撃が拡大',
    deathsTotal: '推計15万人超（記録された死者は数万人。飢餓・疾病による間接死が多い）',
    deathsSource: '国連（UNRIC）、ACLED、各種推計',
    deathsAsOf: '2026年前半',
    idps: '約900万人',
    refugees: '約440万人（チャド・南スーダン・エジプトなど）',
    displacedSource: '国連・UNHCR（2026年春）',
    hungerAffected: '約2,100万人が深刻な食料不安。ダルフールとコルドファンの一部で飢饉を確認',
    needHumanitarian: '約3,370万人',
    humanitarianSource: 'OCHA（2026年5月）',
    latestDevelopment:
      '国軍は一部で巻き返す一方、RSFはダルフールのほぼ全域を支配。2026年10月にはハルツーム空港周辺へのドローン攻撃で子どもが死亡するなど、民間人の被害が続く。国軍のブルハン司令官は交渉を拒否し、全土の奪還を宣言している。',
    latestDate: '2026年10月',
    sources: [
      { label: 'Al Jazeera（2026年10月7日）', url: 'https://www.aljazeera.com/news/2026/10/7/sudans-al-burhan-rejects-talks-vows-to-retake-all-territory-from-rsf' },
      { label: 'UNHCR スーダン', url: 'https://www.unhcr.org/emergencies/sudan-emergency' },
      { label: 'OCHA スーダン', url: 'https://www.unocha.org/sudan' },
    ],
    accentColor: '#f59e0b',
    region: '東アフリカ',
  },
  {
    id: 'myanmar-civil-war',
    name: 'ミャンマー内戦',
    startDate: '2021-02-01',
    status: 'active',
    phase: '国軍と、人民防衛隊（PDF）・少数民族武装勢力の戦闘。長期の膠着',
    deathsTotal: '推計5万人超',
    deathsSource: 'ACLED・AAPP（ミャンマー政治犯支援協会）',
    deathsAsOf: '2024年末',
    idps: '約330万人',
    refugees: '約15万人（タイ・インド）。ロヒンギャ難民は別に100万人超',
    displacedSource: 'IDMC・UNHCR（2025年）',
    hungerAffected: '約1,580万人',
    needHumanitarian: '約1,900万人',
    humanitarianSource: 'OCHA（2025年）',
    latestDevelopment:
      '国軍は一部で失地を回復したものの、ラカイン州のアラカン軍、カチン州・シャン州の武装勢力、カレン民族同盟などとの戦闘が各地で続く（2026年10月）。国軍は個別の勢力に和平協議を呼びかけているが、主要な抵抗勢力は応じていない。',
    latestDate: '2026年10月',
    sources: [
      { label: 'UNHCR ミャンマー', url: 'https://www.unhcr.org/countries/myanmar' },
      { label: 'OCHA ミャンマー', url: 'https://www.unocha.org/myanmar' },
      { label: 'AAPP', url: 'https://aappb.org' },
    ],
    accentColor: '#8b5cf6',
    region: '東南アジア',
  },
  {
    id: 'yemen-civil-war',
    name: 'イエメン内戦',
    startDate: '2015-03-26',
    status: 'active',
    phase: 'フーシ派と政府側の内戦に、2026年のイラン戦争が重なり再び地域戦争化',
    deathsTotal: '推計37万7千人（戦闘・飢餓・疾病による死者の合計）',
    deathsSource: 'UNDP',
    deathsAsOf: '2021年推計',
    idps: '約460万人',
    refugees: '約8万人',
    displacedSource: 'UNHCR・IDMC（2025年）',
    hungerAffected: '約1,750万人（深刻な食料不安）',
    needHumanitarian: '約2,140万人',
    humanitarianSource: 'OCHA（2025年）',
    latestDevelopment:
      'フーシ派は2026年7月にサウジアラビア関連船舶の封鎖を宣言し、8月にはバブ・エル・マンデブ海峡で死者の出る商船攻撃も起きた。その後は海上攻撃が減る一方、サウジアラビアへのミサイル攻撃や海峡周辺での地上戦が激化している（2026年10月）。',
    latestDate: '2026年10月',
    sources: [
      { label: 'ACLED レポート', url: 'https://acleddata.com/report/houthi-gains-around-bab-al-mandab-raise-risks-red-sea-shipping-and-global-oil-markets' },
      { label: 'OCHA イエメン', url: 'https://www.unocha.org/yemen' },
      { label: 'WFP イエメン', url: 'https://www.wfp.org/countries/yemen' },
    ],
    accentColor: '#059669',
    region: '中東',
  },
  {
    id: 'syrian-civil-war',
    name: 'シリア（アサド政権崩壊後の移行期）',
    startDate: '2011-03-15',
    status: 'ceasefire',
    phase: '2024年12月のアサド政権崩壊後の暫定政権期。南部のドルーズ派地域などで武力衝突',
    deathsTotal: '推計50万〜60万人（2011年以降の内戦の累計）',
    deathsSource: 'シリア人権監視団（SOHR）・国連',
    deathsAsOf: '2025年',
    idps: '約650万人（国内）',
    refugees: '約530万人（トルコ・レバノン・ヨルダンなど）',
    displacedSource: 'UNHCR（2025年）',
    hungerAffected: '約1,200万人',
    needHumanitarian: '約1,650万人',
    humanitarianSource: 'OCHA（2025年）',
    latestDevelopment:
      '暫定政権のもとで国家の再建が進む一方、2025年7月以降、南部スワイダのドルーズ派武装勢力と政府側の衝突が続き、2026年8月には封鎖が強まったと報じられた。クルド系勢力（SDF）の国軍への統合も課題として残る。',
    latestDate: '2026年8月',
    sources: [
      { label: '英国下院図書館ブリーフィング', url: 'https://commonslibrary.parliament.uk/research-briefings/cbp-10430/' },
      { label: 'UNHCR シリア', url: 'https://www.unhcr.org/syria-emergency' },
      { label: 'OCHA シリア', url: 'https://www.unocha.org/syria' },
    ],
    accentColor: '#0891b2',
    region: '中東',
  },
];

/** 編集部が上記の内容を確認した日（自動更新しない） */
export const LIVE_DATA_REVIEWED = '2026-10-20';

export const LIVE_DATA_SOURCES = [
  { name: 'ACLED', url: 'https://acleddata.com', desc: '武力紛争の位置・事象データ' },
  { name: 'UNHCR', url: 'https://www.unhcr.org/refugee-statistics', desc: '難民・避難民統計' },
  { name: 'OCHA', url: 'https://www.unocha.org', desc: '国連人道問題調整事務所' },
  { name: 'WFP', url: 'https://www.wfp.org', desc: '世界食糧計画の飢餓モニタリング' },
  { name: 'IPC', url: 'https://www.ipcinfo.org', desc: '食料安全保障フェーズ分類' },
  { name: 'CFR Global Conflict Tracker', url: 'https://www.cfr.org/global-conflict-tracker', desc: '主要紛争の概況' },
];
