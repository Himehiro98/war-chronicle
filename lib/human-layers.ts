import { HumanLayerData } from './types';

/**
 * 人間視点レイヤー — 戦争を「地図ゲーム」化しないための感情導線
 *
 * 7軸：
 * - civilianLife    : 市民生活への影響
 * - refugees        : 難民・避難
 * - hunger          : 飢餓・物資不足
 * - trauma          : PTSD・世代継承
 * - children        : 子どもへの影響
 * - cityDestruction : 都市破壊
 * - oneDayStory     : 没入型「ある市民の一日」
 *
 * エージェント生成中。完了後に上書きされる。
 */
export const HUMAN_LAYERS: Record<string, HumanLayerData> = {};
