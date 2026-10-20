import type { Metadata } from 'next';
import { LESSONS } from '@/lib/lessons';
import { WARS_CHRONO } from '@/lib/war-data';
import { firstSentence, formatYear } from '@/lib/text';
import FlashcardDeck, { type Card } from '@/components/practice/FlashcardDeck';

export const metadata: Metadata = {
  title: 'フラッシュカード',
  description: '戦争の年代・舞台・構造パターン・教訓を、思い出す練習で覚えるフラッシュカード。進捗はこの端末に保存されます。',
};

export default function FlashcardsPage() {
  const cards: Card[] = [];
  for (const w of WARS_CHRONO) {
    const period = w.year === w.endYear ? `${formatYear(w.year)}年` : `${formatYear(w.year)}年〜${w.ongoing ? '現在も継続中' : `${formatYear(w.endYear)}年`}`;
    cards.push({ id: `${w.id}-year`, warId: w.id, era: w.era, kind: '年代', q: `「${w.name}」はいつ起きた？`, a: period });
    cards.push({ id: `${w.id}-region`, warId: w.id, era: w.era, kind: '舞台', q: `「${w.name}」の主な舞台は？`, a: w.theater });
    if (w.tags?.length) {
      cards.push({ id: `${w.id}-tags`, warId: w.id, era: w.era, kind: '構造', q: `「${w.name}」の背景にある主な構造パターンは？`, a: w.tags.slice(0, 3).join('・') });
    }
    const lesson = firstSentence(LESSONS[w.id]?.modernLessons, 160);
    if (lesson) cards.push({ id: `${w.id}-lesson`, warId: w.id, era: w.era, kind: '教訓', q: `「${w.name}」から現代が学べることは？`, a: lesson });
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container-read">
          <div className="eyebrow">Practice</div>
          <h1>フラッシュカード</h1>
          <p className="lead">
            問いを見て、答えを思い浮かべてから裏返してください。思い出す練習は、読み返すだけより記憶に残りやすくなります。
            「まだ」にしたカードは次回優先して出てきます。進捗はこの端末に保存されます。
          </p>
        </div>
      </section>
      <div className="container-read practice-body">
        <FlashcardDeck cards={cards} />
      </div>
    </main>
  );
}
