import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WARS } from '@/lib/wars';
import { eraLabel, getWarPageData, regionLabel } from '@/lib/war-data';
import { firstSentence, formatPeriod, stripHtml } from '@/lib/text';
import WarTabs, { type WarTab } from '@/components/war/WarTabs';
import WarActions from '@/components/war/WarActions';
import {
  DetailPanel, DigestPanel, ExamPanel, HumanPanel, LegacyPanel, LessonsPanel,
  PerspectivesPanel, QuickGrasp, StructurePanel, ThinkPrompt, WantaNote, WarChip,
} from '@/components/war/sections';

export const dynamicParams = false;

export function generateStaticParams() {
  return WARS.map((w) => ({ id: w.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const d = getWarPageData(params.id);
  if (!d) return {};
  const { war, content } = d;
  const period = formatPeriod(war.year, war.endYear, war.ongoing);
  const desc = firstSentence(content?.digest.background, 120) || `${war.name}（${period}）`;
  return {
    title: `${war.name}（${period}）`,
    description: desc,
    alternates: { canonical: `/wars/${war.id}` },
    openGraph: { title: `${war.name}｜War Chronicle`, description: desc, type: 'article' },
  };
}

const TYPE_LABEL: Record<string, string> = { war: '戦争', revolution: '革命・内戦', colonial: '植民地戦争' };
const WEIGHT_LABEL: Record<number, string> = { 3: '世界秩序を変えた戦争', 2: '地域秩序を変えた戦争', 1: '内戦・地域紛争' };

export default function WarPage({ params }: { params: { id: string } }) {
  const d = getWarPageData(params.id);
  if (!d) notFound();
  const { war, content, lessons, human, exam, wanta, think, causes, influences, prev, next } = d;
  const period = formatPeriod(war.year, war.endYear, war.ongoing);

  const tabs: WarTab[] = [];
  const panels: Record<string, React.ReactNode> = {};
  const hint = firstSentence(content?.structure?.summary, 160);

  if (content) {
    tabs.push({ id: 'overview', label: '概要' });
    panels.overview = (
      <>
        <QuickGrasp content={content} lessons={lessons} />
        <DigestPanel data={content.digest} />
        <ThinkPrompt question={think} hint={hint} />
        <WantaNote text={wanta.digest} />
      </>
    );
    tabs.push({ id: 'story', label: '詳しく読む' });
    panels.story = (<><DetailPanel data={content.detail} /><WantaNote text={wanta.detail} /></>);

    if (content.perspectives?.length) {
      tabs.push({ id: 'perspectives', label: '各国の視点' });
      panels.perspectives = (<><PerspectivesPanel data={content.perspectives} /><WantaNote text={wanta.perspectives} /></>);
    }
    tabs.push({ id: 'structure', label: '構造' });
    panels.structure = (<><StructurePanel data={content.structure} /><WantaNote text={wanta.structure} /></>);

    tabs.push({ id: 'legacy', label: 'その後' });
    panels.legacy = (<><LegacyPanel data={content.legacy} causes={causes} influences={influences} /><WantaNote text={wanta.legacy} /></>);
  }
  if (human) {
    tabs.push({ id: 'people', label: '市民の視点' });
    panels.people = (<><HumanPanel data={human} /><WantaNote text={wanta.human} /></>);
  }
  if (lessons) {
    tabs.push({ id: 'lessons', label: '教訓' });
    panels.lessons = (<><LessonsPanel data={lessons} /><ThinkPrompt question={think} hint={hint} /><WantaNote text={wanta.lessons} /></>);
  }
  if (exam.length) {
    tabs.push({ id: 'exam', label: '論述問題' });
    panels.exam = (<><ExamPanel questions={exam} /><WantaNote text={wanta.exam} /></>);
  }

  const speakText = stripHtml(content?.digest.background ?? '');

  return (
    <main>
      <section className="page-hero war-hero">
        <div className="container">
          <nav className="crumbs" aria-label="パンくずリスト">
            <Link href="/">ホーム</Link> ／ <Link href="/wars">戦争一覧</Link> ／ <Link href={`/wars?era=${war.era}`}>{eraLabel(war)}</Link>
          </nav>
          <h1>{war.name}</h1>
          <div className="war-hero__meta">
            <span className="war-hero__period">{period}</span>
            {war.ongoing && <span className="war-hero__badge">継続中</span>}
            <span>{war.theater}</span>
          </div>
          <div className="war-hero__facts">
            <span>{regionLabel(war)}</span>
            <span>{TYPE_LABEL[war.type] ?? war.type}</span>
            {war.weight && <span>{WEIGHT_LABEL[war.weight]}</span>}
          </div>
          {war.tags && war.tags.length > 0 && (
            <div className="war-hero__tags" aria-label="構造パターン">
              {war.tags.map((t) => (
                <Link key={t} href={`/patterns?tag=${encodeURIComponent(t)}`} className="war-hero__tag">{t}</Link>
              ))}
            </div>
          )}
          <div className="war-hero__bottom">
            <WarActions name={war.name} period={period} theater={war.theater} speakText={speakText} />
            {war.cotenLinks && war.cotenLinks.length > 0 && (
              <div className="war-hero__coten">
                <span>関連ポッドキャスト：</span>
                {war.cotenLinks.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">COTEN RADIO「{l.title}」</a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container war-body">
        {tabs.length > 0 ? (
          <WarTabs tabs={tabs} panels={panels} />
        ) : (
          <p className="muted" style={{ padding: '40px 0' }}>この戦争の解説は準備中です。</p>
        )}

        <nav className="war-pager" aria-label="年代順で前後の戦争">
          {prev ? (
            <Link href={`/wars/${prev.id}`} className="war-pager__link">
              <span className="war-pager__dir">← 前の戦争（年代順）</span>
              <span className="war-pager__name">{prev.name}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/wars/${next.id}`} className="war-pager__link war-pager__link--next">
              <span className="war-pager__dir">次の戦争（年代順） →</span>
              <span className="war-pager__name">{next.name}</span>
            </Link>
          ) : <span />}
        </nav>

        {(causes.length > 0 || influences.length > 0) && (
          <section className="war-more">
            <h2 className="panel-subhead">あわせて読みたい</h2>
            <div className="war-chip-list">
              {[...causes, ...influences].slice(0, 8).map((w) => <WarChip key={w.id} war={w} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
