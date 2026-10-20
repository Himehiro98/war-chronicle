import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'War Chronicle — 多角的戦争史データベース',
    short_name: 'War Chronicle',
    description: '戦争は突然起きない。古代から現代までの戦争を、時系列・地理・因果・構造で横断して読む歴史学習サイト。',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
