'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MatchItem {
  warId: string;
  warName: string;
  score: number;
  matchedFactors: string[];
  reasoning: string;
  warningSign: string;
}
interface DiagnoseResult {
  matches: MatchItem[];
  overallRisk: 'high' | 'medium' | 'low';
  summary: string;
}

const EXAMPLES: { label: string; text: string }[] = [
  { label: '海峡をめぐる緊張', text: 'ある大国が、海峡を挟んだ島の統一を国家目標に掲げ、周辺での軍事演習を繰り返している。島の側は同盟国の支援を求め、双方で軍備増強とナショナリズムの高まりが続いている。' },
  { label: '核開発と先制攻撃', text: '核開発を進める国に対し、敵対国が施設への攻撃を繰り返している。攻撃を受けた国は報復と、重要な海上交通路の封鎖で対抗し、周辺国も巻き込まれつつある。' },
  { label: '独裁者の退場後の空白', text: '長く続いた独裁政権が崩壊し、暫定政権が成立した。しかし旧政権の治安機構は解体され、宗派・民族ごとの武装勢力が地域ごとに支配を広げ、周辺国がそれぞれを支援している。' },
  { label: '経済危機と排外主義', text: '深刻なインフレと失業が続く中、移民や少数派を非難する政党が急速に支持を伸ばしている。政府は隣国との領土問題で強硬姿勢をとり、国民の不満を外に向けようとしている。' },
];

const RISK = {
  high: { label: '構造的な類似が強い', cls: 'is-high' },
  medium: { label: '一部に類似がある', cls: 'is-medium' },
  low: { label: '類似は限定的', cls: 'is-low' },
};

export default function DiagnoseView() {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!situation.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || '分析中にエラーが発生しました');
      else setResult(data);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnose">
      <div className="card diagnose__form">
        <div className="diagnose__examples">
          <span>例から選ぶ：</span>
          {EXAMPLES.map((e) => (
            <button key={e.label} type="button" className="chip" onClick={() => setSituation(e.text)}>{e.label}</button>
          ))}
        </div>
        <label htmlFor="situation" className="sr-only">分析したい状況</label>
        <textarea
          id="situation"
          className="input diagnose__textarea"
          value={situation}
          maxLength={5000}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
          placeholder="例：ある大国が隣国の資源の豊富な地域に軍事的圧力をかけ、周辺国が同盟を組んで対抗しようとしている。経済制裁の応酬が激しくなり、国内では民族主義的な世論が高まっている…"
        />
        <div className="diagnose__actions">
          <span className="muted">{situation.length} / 5000文字・Ctrl+Enterでも送信できます</span>
          <button type="button" className="btn btn--accent" disabled={!situation.trim() || loading} onClick={submit}>
            {loading ? '分析しています…' : 'AIで分析する'}
          </button>
        </div>
      </div>

      {error && <div className="diagnose__error" role="alert">{error}</div>}

      {loading && <p className="muted" style={{ marginTop: 20 }}>{`収録されている戦争と照らし合わせています。20〜40秒ほどかかることがあります。`}</p>}

      {result && (
        <section className="diagnose__result" aria-live="polite">
          <div className={`card diagnose__summary ${RISK[result.overallRisk].cls}`}>
            <div className="diagnose__risk">{RISK[result.overallRisk].label}</div>
            <p>{result.summary}</p>
          </div>
          <ol className="diagnose__matches">
            {result.matches.map((m, i) => (
              <li key={m.warId} className="card diagnose__match">
                <div className="diagnose__match-head">
                  <span className="diagnose__rank">{i + 1}</span>
                  <Link href={`/wars/${m.warId}`} className="diagnose__name">{m.warName}</Link>
                  <span className="diagnose__score">類似度 {m.score}</span>
                </div>
                <div className="diagnose__bar"><span style={{ width: `${m.score}%` }} /></div>
                {m.matchedFactors?.length > 0 && (
                  <div className="feature-card__tags">{m.matchedFactors.map((f) => <span key={f} className="tag">{f}</span>)}</div>
                )}
                <p className="diagnose__reason">{m.reasoning}</p>
                <p className="diagnose__warn"><strong>注意すべき類似点：</strong>{m.warningSign}</p>
                <Link href={`/wars/${m.warId}`} className="diagnose__more">この戦争を詳しく読む →</Link>
              </li>
            ))}
          </ol>
          <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
            AIによる分析は参考情報です。歴史の類似は将来を予言するものではありません。結論ではなく、考えるきっかけとして使ってください。
          </p>
        </section>
      )}
    </div>
  );
}
