import { LessonsData } from './types';
import { LESSONS_PREHISTORIC } from './lessons-prehistoric';
import { LESSONS_ANCIENT } from './lessons-ancient';
import { LESSONS_MEDIEVAL } from './lessons-medieval';
import { LESSONS_RENAISSANCE } from './lessons-renaissance';
import { LESSONS_EARLY_MODERN } from './lessons-early-modern';
import { LESSONS_20TH_CENTURY } from './lessons-20th-century';
import { LESSONS_CONTEMPORARY } from './lessons-contemporary';
import { LESSONS_EXTRA } from './lessons-extra';

/**
 * 教訓データ（マージ済み） — このクロニクルの核心
 *
 * 「過去の戦争を学び、現代の世界において、どのように戦争を防ぐことができるか？」
 *
 * 5軸：
 * - commonalities  : 他の戦争との共通点・パターン
 * - universality   : 普遍的メカニズム
 * - modernLessons  : 現代世界への教訓
 * - preventable    : 防止可能性の分析
 * - reproducibility: 再現性・再発リスク
 */
export const LESSONS: Record<string, LessonsData> = {
  ...LESSONS_PREHISTORIC,
  ...LESSONS_ANCIENT,
  ...LESSONS_MEDIEVAL,
  ...LESSONS_RENAISSANCE,
  ...LESSONS_EARLY_MODERN,
  ...LESSONS_20TH_CENTURY,
  ...LESSONS_CONTEMPORARY,
  ...LESSONS_EXTRA,
};
