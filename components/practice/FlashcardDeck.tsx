'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface Card {
  id: string;
  warId: string;
  era: string;
  kind: '年代' | '舞台' | '構造' | '教訓';
  q: string;
  a: string;
}

type Progress = Record<string, { known: boolean; lastSeen: number; seenCount: number }>;
const STORAGE_KEY = 'war-chronicle-flashcards-v1';

const ERAS: { id: string; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'prehistoric', label: '先史' },
  { id: 'ancient', label: '古代' },
  { id: 'medieval', label: '中世' },
  { id: 'renaissance', label: '近世前期' },
  { id: 'early-modern', label: '近世・近代' },
  { id: '20th-century', label: '20世紀' },
  { id: 'contemporary', label: '21世紀' },
];
const KINDS = ['すべて', '年代', '舞台', '構造', '教訓'] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardDeck({ cards }: { cards: Card[] }) {
  const [progress, setProgress] = useState<Progress>({});
  const [loaded, setLoaded] = useState(false);
  const [era, setEra] = useState('all');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('すべて');
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const progressRef = useRef<Progress>({});
  progressRef.current = progress;

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setProgress(JSON.parse(raw)); } catch { /* noop */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* noop */ }
  }, [progress, loaded]);

  const pool = useMemo(
    () => cards.filter((c) => (era === 'all' || c.era === era) && (kind === 'すべて' || c.kind === kind)),
    [cards, era, kind],
  );

  /** セッションの山札を作る：「まだ」→未学習→「覚えた」の順。中はシャッフル */
  const buildDeck = useCallback(() => {
    const progress = progressRef.current;
    const unknown = pool.filter((c) => progress[c.id] && !progress[c.id].known);
    const unseen = pool.filter((c) => !progress[c.id]);
    const known = pool.filter((c) => progress[c.id]?.known);
    const d = onlyUnknown ? [...shuffle(unknown), ...shuffle(unseen)] : [...shuffle(unknown), ...shuffle(unseen), ...shuffle(known)];
    setDeck(d.slice(0, 30));
    setPos(0);
    setFlipped(false);
  }, [pool, onlyUnknown]);

  // 条件が変わったら山札を作り直す（回答中の進捗変化では作り直さない）
  useEffect(() => { if (loaded) buildDeck(); }, [era, kind, onlyUnknown, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const card = deck[pos];
  const done = loaded && deck.length > 0 && pos >= deck.length;

  const mark = useCallback((known: boolean) => {
    if (!card) return;
    setProgress((p) => ({ ...p, [card.id]: { known, lastSeen: Date.now(), seenCount: (p[card.id]?.seenCount ?? 0) + 1 } }));
    setPos((x) => x + 1);
    setFlipped(false);
  }, [card]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === ' ') { e.preventDefault(); setFlipped((v) => !v); }
      if (flipped && (e.key === 'k' || e.key === 'ArrowRight')) mark(true);
      if (flipped && (e.key === 'j' || e.key === 'ArrowLeft')) mark(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, mark]);

  const stats = useMemo(() => {
    let known = 0, unknown = 0;
    for (const c of pool) { const p = progress[c.id]; if (p?.known) known++; else if (p) unknown++; }
    return { total: pool.length, known, unknown };
  }, [pool, progress]);

  return (
    <div className="deck">
      <div className="filters">
        <div className="filters__row">
          <span className="filters__label">時代</span>
          {ERAS.map((e) => (
            <button key={e.id} type="button" className="chip" aria-pressed={era === e.id} onClick={() => setEra(e.id)}>{e.label}</button>
          ))}
        </div>
        <div className="filters__row">
          <span className="filters__label">種類</span>
          {KINDS.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
          ))}
          <span className="filters__sep" />
          <button type="button" className="chip" aria-pressed={onlyUnknown} onClick={() => setOnlyUnknown((v) => !v)}>覚えていないものだけ</button>
        </div>
        <div className="deck__stats">
          <span>この条件のカード {stats.total}枚</span>
          <span className="is-known">覚えた {stats.known}</span>
          <span className="is-unknown">まだ {stats.unknown}</span>
          <span className="deck__bar"><span style={{ width: `${stats.total ? (stats.known / stats.total) * 100 : 0}%` }} /></span>
        </div>
      </div>

      {!loaded && <div className="deck__card deck__card--placeholder" />}

      {loaded && deck.length === 0 && (
        <p className="muted" style={{ padding: '32px 0' }}>この条件のカードはありません。条件を変えてみてください。</p>
      )}

      {card && (
        <>
          <div className="deck__count">{pos + 1} / {deck.length}（1回30枚まで）</div>
          <button type="button" className={`deck__card${flipped ? ' is-flipped' : ''}`} onClick={() => setFlipped((v) => !v)} aria-live="polite">
            <span className="deck__kind">{card.kind}</span>
            <span className="deck__q">{card.q}</span>
            {flipped ? (
              <span className="deck__a">{card.a}</span>
            ) : (
              <span className="deck__hint">答えを思い浮かべてから、タップ（またはスペースキー）で裏返す</span>
            )}
          </button>
          {flipped ? (
            <div className="deck__actions">
              <button type="button" className="btn btn--ghost" onClick={() => mark(false)}>まだ（← / J）</button>
              <button type="button" className="btn btn--accent" onClick={() => mark(true)}>覚えた（→ / K）</button>
            </div>
          ) : (
            <div className="deck__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setFlipped(true)}>裏返す</button>
            </div>
          )}
          <p className="deck__link"><Link href={`/wars/${card.warId}`}>この戦争のページを開く →</Link></p>
        </>
      )}

      {done && (
        <div className="card deck__done">
          <h2>お疲れさまでした</h2>
          <p>{deck.length}枚を復習しました。「まだ」にしたカードは次の山札で先に出てきます。</p>
          <button type="button" className="btn btn--accent" onClick={buildDeck}>次の山札へ</button>
        </div>
      )}

      <details className="deck__reset">
        <summary>進捗をリセットする</summary>
        <p className="muted">この端末に保存された「覚えた／まだ」の記録をすべて消します。</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setProgress({}); progressRef.current = {}; buildDeck(); }}>リセットする</button>
      </details>
    </div>
  );
}
