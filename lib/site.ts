import { WARS } from './wars';

/** サイト全体で使う数値（表記ゆれを防ぐため、数字は必ずデータから計算する。サーバー側専用） */

const formatYear = (y: number) => (y < 0 ? `紀元前${-y}年` : `${y}年`);

export const WAR_COUNT = WARS.length;
export const FIRST_YEAR = Math.min(...WARS.map((w) => w.year));
export const LAST_YEAR = Math.max(...WARS.map((w) => w.endYear));
export const YEAR_RANGE_LABEL = `${formatYear(FIRST_YEAR)}〜現代`;

export const SITE_NAME = 'War Chronicle';
export const SITE_TAGLINE = '戦争は突然起きない。';
export const SITE_DESCRIPTION = `人類は似た条件で何度も衝突してきた。${YEAR_RANGE_LABEL}の${WAR_COUNT}の戦争を、時系列・地理・因果・構造で横断して読む歴史学習サイト。`;
export const SITE_URL = 'https://war-chronicle.vercel.app';
