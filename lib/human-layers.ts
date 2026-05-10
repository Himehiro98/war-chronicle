import { HumanLayerData } from './types';
import { HUMAN_LAYERS_EARLY_MODERN } from './human-layers-early-modern';
import { HUMAN_LAYERS_20TH_CENTURY } from './human-layers-20th-century';
import { HUMAN_LAYERS_CONTEMPORARY } from './human-layers-contemporary';

/**
 * 人間視点レイヤー（マージ済み） — 戦争を「地図ゲーム」化しないための感情導線
 *
 * 7軸：
 * - civilianLife    : 市民生活への影響
 * - refugees        : 難民・避難
 * - hunger          : 飢餓・物資不足
 * - trauma          : PTSD・世代継承
 * - children        : 子どもへの影響
 * - cityDestruction : 都市破壊
 * - oneDayStory     : 没入型「ある市民の一日」
 */
export const HUMAN_LAYERS: Record<string, HumanLayerData> = {
  ...HUMAN_LAYERS_EARLY_MODERN,
  ...HUMAN_LAYERS_20TH_CENTURY,
  ...HUMAN_LAYERS_CONTEMPORARY,
};
