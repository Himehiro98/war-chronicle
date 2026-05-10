import { LearningPath } from './types';

/**
 * キュレーションされた学習パス
 * 100戦争を前にした初学者の「どこから見れば？」に答える
 */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: '20th-century-essentials',
    title: '20世紀を理解する5つの戦争',
    subtitle: '世界秩序はこうして形作られた',
    description:
      '人類最大の二度の大戦と、その間と後に世界を分断した冷戦。20世紀の地政学的構造と現代の国際秩序の起源を、5本の戦争で一気に押さえる。',
    emoji: '🌍',
    accent: '#1e40af',
    warIds: [
      'world-war-1',
      'spanish-civil-war',
      'world-war-2-europe',
      'pacific-war',
      'korean-war',
    ],
    estimatedMinutes: 35,
  },
  {
    id: 'modern-china-route',
    title: '現代中国を理解するルート',
    subtitle: 'なぜ今の中国はあの中国なのか',
    description:
      'アヘン戦争の屈辱から共産党革命、文化大革命、そして改革開放まで。現代中国の「百年の屈辱」史観と「中華民族の偉大な復興」の歴史的背景を辿る。',
    emoji: '🐉',
    accent: '#dc2626',
    warIds: [
      'first-opium-war',
      'second-opium-war',
      'taiping-rebellion',
      'sino-japanese-war',
      'boxer-rebellion',
      'second-sino-japanese-war',
      'chinese-civil-war',
    ],
    estimatedMinutes: 45,
  },
  {
    id: 'middle-east-route',
    title: '中東を理解するルート',
    subtitle: '不安定の構造的根源',
    description:
      'オスマン帝国崩壊から続く境界線問題、汎アラブ主義の挫折、シオニズム、革命、宗派対立、資源国家形成。なぜ中東は紛争の連鎖から逃れられないのか。',
    emoji: '🕌',
    accent: '#b45309',
    warIds: [
      'ww1-middle-east',
      'arab-israeli-war-1948',
      'suez-crisis',
      'six-day-war',
      'yom-kippur-war',
      'iran-iraq-war',
      'gulf-war',
      'iraq-war',
      'syrian-civil-war',
      'gaza-war',
    ],
    estimatedMinutes: 55,
  },
  {
    id: 'cold-war-route',
    title: '冷戦を理解するルート',
    subtitle: '直接衝突しない大国対立の作法',
    description:
      '核戦争を避けながら世界全土で戦われた「代理戦争」の構造。陣営化・イデオロギー・封じ込め・デタント・崩壊。今日の「新冷戦」言説を読み解く土台となる。',
    emoji: '🧊',
    accent: '#0f766e',
    warIds: [
      'korean-war',
      'vietnam-war',
      'cuban-missile-crisis',
      'angolan-civil-war',
      'soviet-afghan-war',
      'falklands-war',
      'yugoslav-wars',
    ],
    estimatedMinutes: 50,
  },
  {
    id: 'how-wars-start',
    title: '戦争はこうして起きる：6つのパターン',
    subtitle: '構造から学ぶ戦争発生の力学',
    description:
      '同盟暴走（WW1）、経済危機からの急進化（WW2）、安全保障ジレンマ（冷戦）、誤算（イラク戦争）、権力真空（リビア・シリア）、ナショナリズム（バルカン）。再現される人類のパターンを6本の戦争で。',
    emoji: '🧬',
    accent: '#7c3aed',
    warIds: [
      'world-war-1',         // 同盟暴走
      'world-war-2-europe',  // 経済危機→ナショナリズム
      'cuban-missile-crisis',// 安全保障ジレンマ
      'iraq-war',            // 誤算・誤認知
      'libyan-civil-war',    // 権力真空
      'yugoslav-wars',       // ナショナリズム/民族浄化
    ],
    estimatedMinutes: 40,
  },
];
