import { LearningPath } from './types';

/**
 * キュレーションされた学習パス
 * 多数の戦争を前にした初学者の「どこから読めば？」に答える
 */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: '20th-century-essentials',
    title: '20世紀を理解する5つの戦争',
    subtitle: '世界秩序はこうして形作られた',
    description:
      '二度の世界大戦と、そのあいだのスペイン内戦、そして冷戦の最初の熱戦となった朝鮮戦争。現代の国際秩序がどのように形づくられたかを、5つの戦争で押さえる。',
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
      'アヘン戦争から太平天国、日清戦争、義和団事件、日中戦争、そして国共内戦まで。現代中国が語る「百年の屈辱」と「中華民族の偉大な復興」という物語の歴史的背景を、7つの戦争でたどる。',
    emoji: '🐉',
    accent: '#dc2626',
    warIds: [
      'opium-war',
      'second-opium-war',
      'taiping-rebellion',
      'first-sino-japanese-war',
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
      'world-war-1',
      'first-arab-israeli-war',
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
      '米ソが直接は戦わず、世界各地の内戦や革命が代理戦争になった時代。トルーマン・ドクトリンの起点となったギリシャ内戦から、朝鮮・ハンガリー・キューバ・ベトナム・アンゴラ・アフガニスタン・ニカラグアまで、陣営化と封じ込めの構造をたどる。今日の「新冷戦」を考える土台になる。',
    emoji: '🧊',
    accent: '#0f766e',
    warIds: [
      'greek-civil-war',
      'korean-war',
      'hungarian-uprising',
      'cuban-revolution',
      'vietnam-war',
      'angolan-civil-war',
      'soviet-afghan-war',
      'nicaraguan-revolution',
    ],
    estimatedMinutes: 55,
  },
  {
    id: 'how-wars-start',
    title: '戦争はこうして起きる：6つのパターン',
    subtitle: '構造から学ぶ戦争発生の力学',
    description:
      '同盟の連鎖（第一次世界大戦）、経済危機からの急進化（第二次世界大戦）、安全保障ジレンマ（クリミア戦争）、誤算（イラク戦争）、権力の空白（リビア内戦）、ナショナリズムと民族浄化（ボスニア戦争）。繰り返し現れる6つのパターンを、6つの戦争で学ぶ。',
    emoji: '🧬',
    accent: '#7c3aed',
    warIds: [
      'world-war-1',         // 同盟暴走
      'world-war-2-europe',  // 経済危機→ナショナリズム
      'crimean-war',         // 安全保障ジレンマ（黒海覇権争い）
      'iraq-war',            // 誤算・誤認知
      'libyan-civil-war',    // 権力真空
      'bosnian-war',         // ナショナリズム/民族浄化
    ],
    estimatedMinutes: 40,
  },
];
