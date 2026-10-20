import { WARS } from './wars';
import { formatYear } from './text';
import type { War } from './types';

/** 理解度チェック（サーバーで決定論的に生成してクライアントへ渡す） */
export interface QuizQ {
  question: string;
  options: string[];
  correctIndex: number;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededOrder<T>(items: T[], seed: number): T[] {
  return items
    .map((v, i) => ({ v, k: (seed + i * 7919) % 104729 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);
}

function pickDistinct<T>(pool: T[], h: number, n: number, salt: number): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < n && i < pool.length * 2; i++) {
    const v = pool[(h * (i * salt + 3) + i) % pool.length];
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

const CANDIDATE_TAGS = [
  'ナショナリズム', '経済危機', '安全保障ジレンマ', '資源争奪', '帝国衰退',
  '宗教対立', '革命', '情報戦・プロパガンダ', '同盟暴走', '核抑止',
  '冷戦構造', '植民地解放', '民族浄化', '権力真空', '誤算・誤認知', '指導者個人要因',
];

export function generateQuiz(war: War): QuizQ[] {
  const h = hashStr(war.id);
  const qs: QuizQ[] = [];

  const offsetSets = [[-30, -12, 18], [-22, 9, 27], [-15, 6, 38]];
  const years = seededOrder([war.year, ...offsetSets[h % offsetSets.length].map((o) => war.year + o)], h);
  qs.push({
    question: `「${war.name}」が始まったのは何年？`,
    options: years.map((y) => `${formatYear(y)}年`),
    correctIndex: years.indexOf(war.year),
  });

  const theaters = Array.from(new Set(WARS.filter((w) => w.id !== war.id && w.theater !== war.theater).map((w) => w.theater)));
  const tOpts = seededOrder([war.theater, ...pickDistinct(theaters, h, 3, 13)], h * 3);
  qs.push({ question: `「${war.name}」の主な舞台は？`, options: tOpts, correctIndex: tOpts.indexOf(war.theater) });

  if (war.tags && war.tags.length > 0) {
    const correct = war.tags[h % war.tags.length];
    const pool = CANDIDATE_TAGS.filter((t) => !(war.tags as string[]).includes(t));
    const opts = seededOrder([correct, ...pickDistinct(pool, h, 3, 17)], h * 5);
    qs.push({ question: `「${war.name}」の構造的な要因として、このサイトが挙げているのは？`, options: opts, correctIndex: opts.indexOf(correct) });
  }
  return qs;
}
