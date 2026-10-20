import type { Metadata } from 'next';
import Link from 'next/link';
import { CAUSAL_CHAINS } from '@/lib/causal-chains';
import { WARS_CHRONO, WAR_BY_ID } from '@/lib/war-data';
import { formatPeriod, formatYear } from '@/lib/text';
import TraceSelect from '@/components/TraceSelect';
import type { War } from '@/lib/types';

export const metadata: Metadata = {
  title: '因果の大河：戦争の連鎖をたどる',
  description: 'ひとつの戦争の結末が、次の戦争の原因になる。フランス革命から現代まで、戦争が戦争を生んできた連鎖をたどる。',
};

/** 原因・影響を双方向に解決したグラフ */
const CAUSES: Record<string, Set<string>> = {};
const EFFECTS: Record<string, Set<string>> = {};
for (const w of WARS_CHRONO) {
  for (const c of w.causes ?? []) if (WAR_BY_ID[c]) { (CAUSES[w.id] ??= new Set()).add(c); (EFFECTS[c] ??= new Set()).add(w.id); }
  for (const e of w.influences ?? []) if (WAR_BY_ID[e]) { (EFFECTS[w.id] ??= new Set()).add(e); (CAUSES[e] ??= new Set()).add(w.id); }
}

function walk(start: string, graph: Record<string, Set<string>>, depth = 2) {
  const out: { level: number; war: War }[] = [];
  const seen = new Set([start]);
  let frontier = Array.from(graph[start] ?? []);
  for (let level = 1; level <= depth && frontier.length; level++) {
    const next: string[] = [];
    for (const id of frontier) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ level, war: WAR_BY_ID[id] });
      next.push(...Array.from(graph[id] ?? []).filter((x) => !seen.has(x)));
    }
    frontier = next;
  }
  return out.sort((a, b) => a.war.year - b.war.year);
}

export default function ChainsPage({ searchParams }: { searchParams: { war?: string } }) {
  const connected = WARS_CHRONO.filter((w) => CAUSES[w.id]?.size || EFFECTS[w.id]?.size);
  const traceId = searchParams.war && WAR_BY_ID[searchParams.war] ? searchParams.war : 'world-war-1';
  const trace = WAR_BY_ID[traceId];
  const up = walk(traceId, CAUSES);
  const down = walk(traceId, EFFECTS);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Causal Rivers</div>
          <h1>因果の大河——ドミノをたどる</h1>
          <p className="lead">
            戦争は「点」では起きません。ひとつの戦争の結末が、次の戦争の原因になります。
            ここでは実際の因果のつながりを読める一本道に編み直しました。いまの戦争が、どこから流れてきた水なのかが見えてきます。
          </p>
        </div>
      </section>

      <div className="container-read chains-body">
        <h2 className="panel-subhead">厳選した{CAUSAL_CHAINS.length}つの大河</h2>
        <div className="chains-list">
          {CAUSAL_CHAINS.map((chain) => (
            <section key={chain.id} className="card chain" style={{ '--c': chain.accent } as React.CSSProperties}>
              <header className="chain__head">
                <h3><span aria-hidden>{chain.emoji}</span>{chain.title}</h3>
                <p>{chain.thesis}</p>
              </header>
              <ol className="chain__nodes">
                {chain.nodes.map((node, i) => {
                  const w = WAR_BY_ID[node.id];
                  if (!w) return null;
                  const last = i === chain.nodes.length - 1;
                  return (
                    <li key={node.id}>
                      <Link href={`/wars/${w.id}`} className="chain__war">
                        <span className="chain__num">{i + 1}</span>
                        <span className="chain__name">{w.name}</span>
                        <span className="chain__year">{formatYear(w.year)}</span>
                      </Link>
                      {!last && node.connector && <p className="chain__connector">{node.connector}</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        <section id="tracer" className="tracer">
          <h2 className="panel-subhead">どの戦争からでも因果をたどる</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            戦争を1つ選ぶと、それを生んだ原因（上流）と、それが引き起こした影響（下流）を2世代までさかのぼって表示します。
          </p>
          <TraceSelect
            key={traceId}
            value={traceId}
            options={connected.map((w) => ({ id: w.id, label: `${w.name}（${formatYear(w.year)}年）` }))}
          />

          <div className="tracer__col">
            <div className="tracer__label is-up">▲ 上流：この戦争につながった出来事</div>
            {up.length === 0 ? <p className="muted">記録された原因はありません（この連鎖の源流です）。</p> : (
              <ul className="tracer__list">
                {up.map(({ level, war }) => (
                  <li key={war.id} style={{ paddingLeft: (level - 1) * 24 }} className={level > 1 ? 'is-far' : ''}>
                    <Link href={`/chains?war=${war.id}#tracer`}>{war.name}</Link>
                    <span>{formatYear(war.year)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="tracer__center">
            <div>
              <div className="tracer__center-name">{trace.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>{formatPeriod(trace.year, trace.endYear, trace.ongoing)}</div>
            </div>
            <Link href={`/wars/${trace.id}`} className="btn btn--accent btn--sm">この戦争を読む →</Link>
          </div>

          <div className="tracer__col">
            <div className="tracer__label is-down">▼ 下流：この戦争が影響を与えた出来事</div>
            {down.length === 0 ? <p className="muted">記録された影響はありません。</p> : (
              <ul className="tracer__list">
                {down.map(({ level, war }) => (
                  <li key={war.id} style={{ paddingLeft: (level - 1) * 24 }} className={level > 1 ? 'is-far' : ''}>
                    <Link href={`/chains?war=${war.id}#tracer`}>{war.name}</Link>
                    <span>{formatYear(war.year)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>※ 名前を選ぶと、その戦争を起点に切り替わります。</p>
        </section>

        <aside className="wanta-note" style={{ marginTop: 40 }}>
          <img src="/wanta.png" alt="" width={56} height={56} className="wanta-note__img" />
          <div className="wanta-note__bubble">
            <div className="wanta-note__name">わんたのひとこと</div>
            <p>
              戦争は孤立した事件じゃなくて、過去から流れてきて未来へ注ぐ「川」なんだワン。
              今ニュースで見る戦争も、上流をたどれば昔の未解決の問題にぶつかる。「この戦争の源流はどこ？」と問いかける癖が、次のドミノを止める知恵になるワン。
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
