import type { Metadata } from 'next';
import RiskChecklist, { type RiskWar } from '@/components/practice/RiskChecklist';
import { LESSONS } from '@/lib/lessons';
import { WARS_CHRONO } from '@/lib/war-data';
import { firstSentence, formatPeriod } from '@/lib/text';

export const metadata: Metadata = {
  title: '構造リスク診断',
  description: '過去の戦争の前に揃っていた条件をチェックリストで確認し、同じ条件が揃っていた戦争と、その教訓を見ることができます。',
};

export default function RiskCheckPage() {
  const wars: RiskWar[] = WARS_CHRONO.filter((w) => w.tags?.length).map((w) => ({
    id: w.id,
    name: w.name,
    period: formatPeriod(w.year, w.endYear, w.ongoing),
    tags: w.tags ?? [],
    weight: w.weight ?? 1,
    lesson: firstSentence(LESSONS[w.id]?.modernLessons, 160),
  }));
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Structural Checklist</div>
          <h1>構造リスク診断——危機はどう始まるか</h1>
          <p className="lead">
            ある国や地域を思い浮かべて、当てはまる条件にチェックしてください。過去の戦争の前に同じ条件が揃っていた例と、そこから得られる教訓が表示されます。
          </p>
        </div>
      </section>
      <div className="container practice-body">
        <RiskChecklist wars={wars} />
      </div>
    </main>
  );
}
