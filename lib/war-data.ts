/**
 * 戦争ページ用のデータ組み立て（サーバー専用）。
 * content / lessons / human / exam など重いデータはここでだけ読み込み、
 * クライアントバンドルに入れない。
 */
import { WARS, ERA_CONFIG, REGIONS } from './wars';
import { WAR_CONTENT } from './content';
import { LESSONS } from './lessons';
import { HUMAN_LAYERS } from './human-layers';
import { EXAM_QUESTIONS } from './exam-questions';
import { THINK_QUESTIONS } from './think-questions';
import { WANTA_COMMENTS } from './wanta';
import { MYTHS } from './myths';
import type { War, WarTag } from './types';

/** 年代順（開始年→終了年→名前）に並べた戦争リスト */
export const WARS_CHRONO: War[] = [...WARS].sort(
  (a, b) => a.year - b.year || a.endYear - b.endYear || a.name.localeCompare(b.name, 'ja'),
);

export const WAR_BY_ID: Record<string, War> = Object.fromEntries(WARS.map((w) => [w.id, w]));

export function eraLabel(war: War) {
  return ERA_CONFIG[war.era].label;
}
export function regionLabel(war: War) {
  return REGIONS[war.region];
}

/** タグ別テンプレート（個別の問いが無い戦争用） */
const THINK_TEMPLATES: Partial<Record<WarTag, string>> = {
  'ナショナリズム': 'もし「自分たちは特別な民族だ」という物語がなかったら、この戦争は起きたでしょうか。',
  '経済危機': '経済の苦しさは、なぜ「外の敵」への攻撃に向かったのでしょうか。',
  '安全保障ジレンマ': '「相手が攻めてくるかもしれないから先に備える」——この連鎖はどこで止められたでしょうか。',
  '資源争奪': 'もしこの資源に価値がなかったら、この地域の歴史はどう変わっていたでしょうか。',
  '帝国衰退': '衰退する大国は、なぜ穏やかに退場できないのでしょうか。',
  '宗教対立': '宗教の違いは原因だったのでしょうか。それとも対立を正当化する言葉として使われたのでしょうか。',
  '革命': '革命を起こした人々の理想と、その後の現実はなぜずれたのでしょうか。',
  '情報戦・プロパガンダ': '当時の人々は何を信じさせられていたのでしょうか。今の自分なら見抜けるでしょうか。',
  '同盟暴走': '味方を増やすための同盟が、なぜ戦争を広げる装置になったのでしょうか。',
  '核抑止': '核兵器は戦争を防いだのでしょうか。それとも別の形の危険を生んだのでしょうか。',
  '冷戦構造': '大国の対立は、なぜ遠く離れた国の内戦として戦われたのでしょうか。',
  '植民地解放': '独立を勝ち取った後、なぜ多くの国で新たな苦難が始まったのでしょうか。',
  '民族浄化': '隣人同士だった人々が、なぜ殺し合うようになったのでしょうか。転換点はどこにあったでしょうか。',
  '権力真空': '強い支配者が消えた後の空白は、なぜ平和ではなく混乱を生むのでしょうか。',
  '誤算・誤認知': '開戦を決めた指導者は何を読み違えたのでしょうか。正しい情報があれば違ったでしょうか。',
  '指導者個人要因': '指導者が別の人物だったら、歴史は変わったでしょうか。それとも構造が同じ結果を生んだでしょうか。',
};
const THINK_FALLBACK = 'この戦争と同じ条件が今の世界のどこかで揃いつつあるとしたら、それはどこでしょうか。';

export function getWarPageData(id: string) {
  const war = WAR_BY_ID[id];
  if (!war) return null;
  const content = WAR_CONTENT[id] ?? null;
  const lessons = LESSONS[id] ?? content?.lessons ?? null;
  const human = HUMAN_LAYERS[id] ?? content?.human ?? null;
  const exam = EXAM_QUESTIONS[id] ?? [];
  const myths = MYTHS[id] ?? [];
  const wanta = { ...(content?.wanta ?? {}), ...(WANTA_COMMENTS[id] ?? {}) };

  const tag = (war.tags ?? []).find((t) => THINK_TEMPLATES[t]);
  const think = THINK_QUESTIONS[id] ?? (tag ? THINK_TEMPLATES[tag]! : THINK_FALLBACK);

  const resolve = (ids?: string[]) => (ids ?? []).map((x) => WAR_BY_ID[x]).filter((w): w is War => !!w);
  const causes = resolve(war.causes);
  // 双方向にする：他の戦争の influences に自分が含まれていれば「原因」とみなす
  for (const w of WARS) {
    if (w.influences?.includes(id) && !causes.some((c) => c.id === w.id)) causes.push(w);
  }
  const influences = resolve(war.influences);
  for (const w of WARS) {
    if (w.causes?.includes(id) && !influences.some((c) => c.id === w.id)) influences.push(w);
  }
  causes.sort((a, b) => a.year - b.year);
  influences.sort((a, b) => a.year - b.year);

  const idx = WARS_CHRONO.findIndex((w) => w.id === id);
  const prev = idx > 0 ? WARS_CHRONO[idx - 1] : null;
  const next = idx < WARS_CHRONO.length - 1 ? WARS_CHRONO[idx + 1] : null;

  return { war, content, lessons, human, exam, myths, wanta, think, causes, influences, prev, next };
}

export type WarPageData = NonNullable<ReturnType<typeof getWarPageData>>;
