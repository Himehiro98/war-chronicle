import type { MythEntry } from '../types';
import { MYTHS_PREHISTORIC } from './prehistoric';
import { MYTHS_ANCIENT } from './ancient';
import { MYTHS_MEDIEVAL } from './medieval';
import { MYTHS_RENAISSANCE } from './renaissance';
import { MYTHS_EARLY_MODERN } from './early-modern';
import { MYTHS_C20_CENTURY } from './20th-century';
import { MYTHS_CONTEMPORARY } from './contemporary';

/** 戦争ID → 通説と史実 */
export const MYTHS: Record<string, MythEntry[]> = {
  ...MYTHS_PREHISTORIC,
  ...MYTHS_ANCIENT,
  ...MYTHS_MEDIEVAL,
  ...MYTHS_RENAISSANCE,
  ...MYTHS_EARLY_MODERN,
  ...MYTHS_C20_CENTURY,
  ...MYTHS_CONTEMPORARY,
};
