import { ExamQuestion } from './types';
import { EXAM_QUESTIONS_1 } from './exam-questions-1';
import { EXAM_QUESTIONS_2 } from './exam-questions-2';
import { EXAM_QUESTIONS_3 } from './exam-questions-3';
import { EXAM_QUESTIONS_4 } from './exam-questions-4';

/**
 * 論述チャレンジ（マージ済み）
 *
 * ⚠️ 全問題は本サイトのオリジナル問題です。
 * 実在の大学入試問題の転載ではありません（著作権保護のため）。
 * 出題形式は国公立二次試験・難関私大の論述スタイルを踏襲し、
 * 内容は本サイトのファクトチェック済みコンテンツに基づきます。
 */
export const EXAM_QUESTIONS: Record<string, ExamQuestion[]> = {
  ...EXAM_QUESTIONS_1,
  ...EXAM_QUESTIONS_2,
  ...EXAM_QUESTIONS_3,
  ...EXAM_QUESTIONS_4,
};
