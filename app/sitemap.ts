import type { MetadataRoute } from 'next';
import { WARS } from '@/lib/wars';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { RELIGION_THEMES } from '@/lib/religion-themes';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '', '/chronicle', '/learn', '/themes', '/religions', '/explore', '/wars', '/compare', '/search',
    '/patterns', '/chains', '/lessons', '/flashcards', '/diagnose', '/risk-check', '/wanta', '/live',
  ];
  return [
    ...staticPaths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: p === '/live' ? ('weekly' as const) : ('monthly' as const), priority: p === '' ? 1 : 0.7 })),
    ...WARS.map((w) => ({ url: `${SITE_URL}/wars/${w.id}`, changeFrequency: (w.ongoing ? 'weekly' : 'yearly') as 'weekly' | 'yearly', priority: w.weight === 3 ? 0.8 : 0.6 })),
    ...LEARNING_PATHS.map((p) => ({ url: `${SITE_URL}/learn/${p.id}`, priority: 0.6 })),
    ...MODERN_THEMES.map((t) => ({ url: `${SITE_URL}/themes/${t.id}`, priority: 0.6 })),
    ...RELIGION_THEMES.map((r) => ({ url: `${SITE_URL}/religions/${r.id}`, priority: 0.6 })),
  ];
}
