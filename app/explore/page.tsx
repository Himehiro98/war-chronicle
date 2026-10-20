import type { Metadata } from 'next';
import { Suspense } from 'react';
import ExploreView from '@/components/explore/ExploreView';
import { WAR_CONTENT } from '@/lib/content';
import { WARS } from '@/lib/wars';
import { firstSentence } from '@/lib/text';

export const metadata: Metadata = {
  title: '年表・地図で探す',
  description: '時代と地域で戦争を俯瞰する年表と世界地図。気になる戦争を選ぶと、場所と概要を確認して詳しい解説へ進めます。',
};

export default function ExplorePage() {
  // プレビュー用の一文だけをクライアントに渡す（本文データは渡さない）
  const summaries: Record<string, string> = {};
  for (const w of WARS) {
    const s = firstSentence(WAR_CONTENT[w.id]?.digest.background, 140);
    if (s) summaries[w.id] = s;
  }
  return (
    <Suspense>
      <ExploreView summaries={summaries} />
    </Suspense>
  );
}
