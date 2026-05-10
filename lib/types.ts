export type WarType = 'war' | 'revolution' | 'colonial';
export type RegionId = 0 | 1 | 2 | 3; // 欧州/アジア/中東・アフリカ/南北米
export type EraId = 'prehistoric' | 'ancient' | 'medieval' | 'renaissance' | 'early-modern' | '20th-century' | 'contemporary';

/**
 * 戦争の構造タグ — 戦争を「英雄譚」ではなく「再現可能な構造」として分析するための分類軸
 */
export type WarTag =
  | 'ナショナリズム'
  | '経済危機'
  | '安全保障ジレンマ'
  | '資源争奪'
  | '帝国衰退'
  | '宗教対立'
  | '革命'
  | '情報戦・プロパガンダ'
  | '同盟暴走'
  | '核抑止'
  | '冷戦構造'
  | '植民地解放'
  | '民族浄化'
  | '権力真空'
  | '誤算・誤認知'
  | '指導者個人要因';

/**
 * 戦争の重み — 情報レイヤー
 * 3 = 世界秩序を変えた戦争（WW1/WW2/冷戦/仏革命/ナポレオン等）
 * 2 = 帝国・地域秩序の戦争（普仏/日露/クリミア/朝鮮/湾岸等）
 * 1 = 内戦・代理戦争・ハイブリッド戦
 */
export type WarWeight = 1 | 2 | 3;

export interface War {
  id: string;
  year: number;
  endYear: number;
  name: string;
  region: RegionId;
  type: WarType;
  era: EraId;
  theater: string;
  mapHighlight: string;
  markers: MapMarker[];
  cotenLinks?: { title: string; url: string }[];
  // 教育プラットフォーム化のための拡張フィールド
  weight?: WarWeight;       // 情報レイヤー（重み）
  tags?: WarTag[];          // 構造タグ（3-6個推奨）
  causes?: string[];        // この戦争を引き起こした戦争IDs（因果ネットワーク）
  influences?: string[];    // この戦争が影響を与えた戦争IDs
  ideologies?: string[];    // 関連イデオロギー（ナショナリズム/共産主義/民族自決 等）
}

export interface MapMarker {
  coordinates: [number, number]; // [longitude, latitude]
  label: string;
  isMain?: boolean;
  ally?: boolean;
  enemy?: boolean;
}

export interface TabContent {
  digest: DigestData;
  detail: DetailData;
  perspectives: PerspectiveData[];
  structure: StructureData;
  legacy: LegacyData[];
  lessons?: LessonsData;
  wanta?: WantaComments;
  human?: HumanLayerData;   // 人間視点レイヤー
}

/**
 * 教訓（Lessons）— 本クロニクルの核心
 * 過去の戦争を科学的に分析し、現代における戦争防止の示唆を得る
 */
export interface LessonsData {
  commonalities: string;    // 他の戦争との共通点・パターン
  universality: string;     // 普遍的メカニズム（権力真空・誤算・同盟連鎖など）
  modernLessons: string;    // 現代世界への教訓
  preventable: string;      // 防止可能性の分析（防げたか？防げなかったか？）
  reproducibility: string;  // 再現性・再発リスク要因（同じ条件が揃ったら？）
}

/**
 * 人間視点レイヤー — 戦争を「地図ゲーム」化しないための感情導線
 */
export interface HumanLayerData {
  civilianLife: string;     // 市民生活への影響
  refugees: string;         // 難民・避難
  hunger: string;           // 飢餓・物資不足
  trauma: string;           // PTSD・世代継承
  children: string;         // 子どもへの影響
  cityDestruction: string;  // 都市破壊
  oneDayStory: string;      // 没入型「ある市民の一日」
}

export interface WantaComments {
  digest?: string;
  detail?: string;
  perspectives?: string;
  structure?: string;
  legacy?: string;
  lessons?: string;
  human?: string;
}

export interface DigestData {
  background: string;
  actors: string;
  structural: string;
  aftermath: string;
}

export interface DetailData {
  title: string;
  kicker: string;
  lead: string;
  sections: { heading: string; body: string }[];
}

export interface PerspectiveData {
  flag: string;
  nation: string;
  text: string;
  wide?: boolean;
}

export interface StructureData {
  summary: string;
  factors: { title: string; body: string }[];
}

export interface LegacyData {
  label: string;
  color: string;
  text: string;
}

/**
 * 学習パス — キュレーションされた読み順
 */
export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  accent: string;        // アクセントカラー
  warIds: string[];      // 順序に意味あり
  estimatedMinutes: number;
}

/**
 * 現代テーマ — 「なぜ◯◯？」の問いから歴史に降りる
 */
export interface ModernTheme {
  id: string;
  question: string;       // "なぜロシアはNATOを恐れるのか"
  shortAnswer: string;
  background: string;     // 歴史的背景
  keyWarIds: string[];    // 関連戦争ID
  keyConcepts: string[];  // 重要概念（バッファゾーン論等）
  modernSituation: string;// 現代の状況
  emoji: string;
  accent: string;
}

/**
 * タグ詳細 — タグ自体の構造解説
 */
export interface TagDescription {
  tag: WarTag;
  shortDesc: string;       // 一文での定義
  mechanism: string;       // 作動メカニズム
  classicCase: string;     // 古典的事例
  modernRisk: string;      // 現代の警戒対象
  accent: string;          // 表示色
  emoji: string;
}
