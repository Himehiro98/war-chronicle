import type { Metadata } from 'next';
import Link from 'next/link';
import { LIVE_CONFLICTS, LIVE_DATA_REVIEWED, LIVE_DATA_SOURCES, type LiveConflictStats } from '@/lib/live-conflicts';

export const metadata: Metadata = {
  title: '進行中の戦争',
  description: 'ウクライナ、イランをめぐる戦争、ガザ、スーダン、ミャンマー、イエメンなど、いま続いている武力紛争の現状と人道状況を、出典と基準時点つきでまとめています。',
};

const STATUS = {
  active: { label: '戦闘継続', cls: 'is-active' },
  ceasefire: { label: '停戦・移行期（不安定）', cls: 'is-ceasefire' },
  frozen: { label: '膠着', cls: 'is-frozen' },
} as const;

const reviewedLabel = (() => {
  const [y, m, d] = LIVE_DATA_REVIEWED.split('-').map(Number);
  return `${y}年${m}月${d}日`;
})();

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="live-stat">
      <div className="live-stat__label">{label}</div>
      <div className="live-stat__value">{value}</div>
      {note && <div className="live-stat__note">{note}</div>}
    </div>
  );
}

function ConflictCard({ c }: { c: LiveConflictStats }) {
  const s = STATUS[c.status];
  const startYear = Number(c.startDate.slice(0, 4));
  return (
    <article className="card live-card" style={{ '--c': c.accentColor } as React.CSSProperties}>
      <header className="live-card__head">
        <div>
          <div className="live-card__meta">
            <span className={`live-badge ${s.cls}`}>{s.label}</span>
            <span>{c.region}・{startYear}年〜</span>
          </div>
          <h2 className="live-card__title">{c.name}</h2>
          <p className="live-card__phase">{c.phase}</p>
        </div>
      </header>

      <section className="live-card__news">
        <div className="live-card__news-label">最新の状況（{c.latestDate}）</div>
        <p>{c.latestDevelopment}</p>
      </section>

      <div className="live-card__stats">
        <Stat label="死者" value={c.deathsTotal} note={`${c.deathsSource}／${c.deathsAsOf}`} />
        <Stat label="国内避難民" value={c.idps} note={c.displacedSource} />
        <Stat label="国外への避難" value={c.refugees} note={c.displacedSource} />
        <Stat label="食料不安" value={c.hungerAffected} note={c.humanitarianSource} />
      </div>

      <footer className="live-card__foot">
        <Link href={`/wars/${c.id}`} className="btn btn--accent btn--sm">背景と歴史を読む →</Link>
        <div className="live-card__sources">
          <span>出典：</span>
          {c.sources.map((src) => (
            <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
          ))}
        </div>
      </footer>
    </article>
  );
}

export default function LivePage() {
  const activeCount = LIVE_CONFLICTS.filter((c) => c.status === 'active').length;
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Now</div>
          <h1>いま続いている戦争</h1>
          <p className="lead">
            戦争は教科書の中だけの出来事ではありません。このページでは、現在も続いている主な武力紛争{LIVE_CONFLICTS.length}件
            （うち戦闘継続{activeCount}件）の現状と人道状況を、それぞれの背景にある歴史とあわせて紹介します。
          </p>
          <p className="live-reviewed">編集部の最終確認：{reviewedLabel}</p>
        </div>
      </section>

      <div className="container live-body">
        <div className="callout callout--quiet live-note">
          <p>
            <strong>数字の読み方：</strong>戦闘中の死者数や避難民数は確認が難しく、資料によって大きく異なります。
            各数字には出典と基準時点を併記しています。基準時点が古い数字は、その後状況が変わっている可能性があります。
            最新の情報は出典のリンク先で確認してください。
          </p>
        </div>

        <div className="live-list">
          {LIVE_CONFLICTS.map((c) => <ConflictCard key={c.id} c={c} />)}
        </div>

        <section className="live-sources">
          <h2 className="panel-subhead">主なデータソース</h2>
          <ul>
            {LIVE_DATA_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                <span className="muted"> — {s.desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
