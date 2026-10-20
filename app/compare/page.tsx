import type { Metadata } from 'next';
import Link from 'next/link';
import { WAR_CONTENT } from '@/lib/content';
import { LESSONS } from '@/lib/lessons';
import { REGIONS } from '@/lib/wars';
import { WARS_CHRONO, WAR_BY_ID } from '@/lib/war-data';
import { firstSentence, formatPeriod, formatYear } from '@/lib/text';
import ComparePicker from '@/components/compare/ComparePicker';
import type { War } from '@/lib/types';

export const metadata: Metadata = {
  title: '戦争を比較する',
  description: '2〜3の戦争を並べて、時代・舞台・構造パターン・背景・その後を比較します。',
};

const TYPE_LABEL: Record<string, string> = { war: '戦争', revolution: '革命・内戦', colonial: '植民地戦争' };

export default function ComparePage({ searchParams }: { searchParams: { w?: string } }) {
  const ids = (searchParams.w ?? 'world-war-1,world-war-2-europe').split(',').filter((id) => WAR_BY_ID[id]).slice(0, 3);
  const wars = ids.map((id) => WAR_BY_ID[id]);
  const shared = wars.length > 1 ? (wars[0].tags ?? []).filter((t) => wars.every((w) => w.tags?.includes(t))) : [];

  const rows: { label: string; render: (w: War) => React.ReactNode }[] = [
    { label: '期間', render: (w) => formatPeriod(w.year, w.endYear, w.ongoing) },
    { label: '地域・種類', render: (w) => `${REGIONS[w.region]}・${TYPE_LABEL[w.type]}` },
    { label: '主な舞台', render: (w) => w.theater },
    {
      label: '構造パターン',
      render: (w) => (
        <div className="feature-card__tags" style={{ marginTop: 0 }}>
          {(w.tags ?? []).map((t) => <span key={t} className={`tag${shared.includes(t) ? ' tag--shared' : ''}`}>{t}</span>)}
        </div>
      ),
    },
    { label: '背景', render: (w) => firstSentence(WAR_CONTENT[w.id]?.digest.background, 200) },
    { label: '主な当事者', render: (w) => firstSentence(WAR_CONTENT[w.id]?.digest.actors, 200) },
    { label: '構造的な要因', render: (w) => firstSentence(WAR_CONTENT[w.id]?.digest.structural, 200) },
    { label: 'その後', render: (w) => firstSentence(WAR_CONTENT[w.id]?.digest.aftermath, 200) },
    { label: '現代への教訓', render: (w) => firstSentence(LESSONS[w.id]?.modernLessons, 200) || '—' },
  ];

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Compare</div>
          <h1>戦争を比較する</h1>
          <p className="lead">2〜3の戦争を並べると、時代や地域が違っても共通する構造が見えてきます。共通する構造パターンは強調表示されます。</p>
        </div>
      </section>

      <div className="container compare-body">
        <ComparePicker
          selected={ids}
          options={WARS_CHRONO.map((w) => ({ id: w.id, label: `${w.name}（${formatYear(w.year)}年）` }))}
        />

        {shared.length > 0 && (
          <p className="compare-shared">共通する構造パターン：{shared.map((t) => <strong key={t}>{t}</strong>)}</p>
        )}

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col" />
                {wars.map((w) => (
                  <th key={w.id} scope="col"><Link href={`/wars/${w.id}`}>{w.name}</Link></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {wars.map((w) => <td key={w.id}>{r.render(w)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
