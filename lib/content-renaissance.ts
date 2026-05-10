import { TabContent } from './types';
import { CONTENT_RENAISSANCE_1 } from './content-renaissance-1';
import { CONTENT_RENAISSANCE_2 } from './content-renaissance-2';

/** 近世初期戦争（1450-1700）のコンテンツ（マージ） */
export const CONTENT_RENAISSANCE: Record<string, TabContent> = {
  ...CONTENT_RENAISSANCE_1,
  ...CONTENT_RENAISSANCE_2,
};
