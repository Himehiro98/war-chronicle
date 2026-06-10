'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LEARNING_PATHS } from '@/lib/learning-paths';
import { WARS, REGIONS } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';
import { LESSONS } from '@/lib/lessons';
import { War } from '@/lib/types';

/**
 * HTMLタグを除いた文字数で切り詰める（プレーンテキスト用）
 */
function truncatePlain(text: string | undefined, max: number): string {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max) + '…';
}

/**
 * HTMLタグ込みで切り詰める（dangerouslySetInnerHTMLで描画用）
 */
function truncateHtml(text: string | undefined, max: number): string {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '');
  if (plain.length <= max) return text;
  let plainCount = 0;
  let result = '';
  let i = 0;
  while (i < text.length && plainCount < max) {
    if (text[i] === '<') {
      const closeIdx = text.indexOf('>', i);
      if (closeIdx === -1) break;
      result += text.slice(i, closeIdx + 1);
      i = closeIdx + 1;
    } else {
      result += text[i];
      plainCount++;
      i++;
    }
  }
  return result + '…';
}

/* ════════════════════════════════════════════════
   習熟度ゲート（Bloom's Mastery Learning）
   前の戦争のクイズに合格（2/3以上）すると次が解放される
   ════════════════════════════════════════════════ */

interface QuizQ {
  question: string;
  options: string[];
  correctIndex: number;
}

/** 決定論的ハッシュ（war.idからクイズを再現可能に生成） */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** 決定論的シャッフル */
function seededOrder<T>(items: T[], seed: number): T[] {
  return items
    .map((v, i) => ({ v, k: (seed + i * 7919) % 104729 }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.v);
}

const CANDIDATE_TAGS = [
  'ナショナリズム', '経済危機', '安全保障ジレンマ', '資源争奪', '帝国衰退',
  '宗教対立', '革命', '情報戦・プロパガンダ', '同盟暴走', '核抑止',
  '冷戦構造', '植民地解放', '民族浄化', '権力真空', '誤算・誤認知', '指導者個人要因',
];

function generateQuiz(war: War): QuizQ[] {
  const h = hashStr(war.id);
  const qs: QuizQ[] = [];

  // Q1: 開始年（誤答は前後オフセット）
  const offsetSets = [[-30, -12, 18], [-22, 9, 27], [-15, 6, 38]];
  const offsets = offsetSets[h % offsetSets.length];
  const yearOpts = seededOrder([war.year, ...offsets.map(o => war.year + o)], h);
  qs.push({
    question: `「${war.name}」が始まった年は？`,
    options: yearOpts.map(y => `${y}年`),
    correctIndex: yearOpts.indexOf(war.year),
  });

  // Q2: 主な戦場（誤答は他の戦争の戦場）
  const otherTheaters = Array.from(new Set(
    WARS.filter(w => w.id !== war.id && w.theater !== war.theater).map(w => w.theater)
  ));
  const distractTheaters = [0, 1, 2].map(i => otherTheaters[(h * (i * 13 + 3) + i) % otherTheaters.length]);
  const theaterUniq = Array.from(new Set(distractTheaters)).slice(0, 3);
  while (theaterUniq.length < 3 && otherTheaters.length > theaterUniq.length) {
    const next = otherTheaters[(h + theaterUniq.length * 31) % otherTheaters.length];
    if (!theaterUniq.includes(next)) theaterUniq.push(next);
  }
  const theaterOpts = seededOrder([war.theater, ...theaterUniq], h * 3);
  qs.push({
    question: `「${war.name}」の主な戦場は？`,
    options: theaterOpts,
    correctIndex: theaterOpts.indexOf(war.theater),
  });

  // Q3: 構造タグ（タグがあれば）／なければ種類
  if (war.tags && war.tags.length > 0) {
    const correct = war.tags[h % war.tags.length];
    const wrongPool = CANDIDATE_TAGS.filter(t => !(war.tags as string[]).includes(t));
    const wrongs = [0, 1, 2].map(i => wrongPool[(h * (i * 17 + 5) + i) % wrongPool.length]);
    const wrongUniq = Array.from(new Set(wrongs)).slice(0, 3);
    while (wrongUniq.length < 3 && wrongPool.length > wrongUniq.length) {
      const next = wrongPool[(h + wrongUniq.length * 41) % wrongPool.length];
      if (!wrongUniq.includes(next)) wrongUniq.push(next);
    }
    const tagOpts = seededOrder([correct, ...wrongUniq], h * 5);
    qs.push({
      question: `「${war.name}」の構造的要因に含まれるのは？`,
      options: tagOpts,
      correctIndex: tagOpts.indexOf(correct),
    });
  } else {
    const typeLabel: Record<string, string> = { war: '戦争（国家間・武力紛争）', revolution: '革命', colonial: '植民地戦争' };
    const correct = typeLabel[war.type];
    const others = Object.values(typeLabel).filter(t => t !== correct);
    const opts = seededOrder([correct, ...others], h * 5);
    qs.push({
      question: `「${war.name}」の種類は？`,
      options: opts,
      correctIndex: opts.indexOf(correct),
    });
  }

  return qs;
}

/** 理解度チェッククイズ（検索練習効果：読んだ直後に思い出す） */
function QuizBlock({ war, accent, onPass }: { war: War; accent: string; onPass: () => void }) {
  const quiz = useMemo(() => generateQuiz(war), [war]);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);

  const allAnswered = answers.every(a => a !== null);
  const correctCount = answers.filter((a, i) => a === quiz[i].correctIndex).length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    if (correctCount >= 2) {
      setResult('pass');
      onPass();
    } else {
      setResult('fail');
    }
  };

  const handleRetry = () => {
    setAnswers(quiz.map(() => null));
    setResult(null);
  };

  return (
    <div className="mt-6 rounded-lg overflow-hidden border" style={{ borderColor: `${accent}55` }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: accent }}>
        <span className="text-sm">✏️</span>
        <span className="text-xs font-bold text-white tracking-wide">
          理解度チェック（2問以上正解で次へ進める）
        </span>
      </div>
      <div className="p-4 bg-white">
        {quiz.map((q, qi) => (
          <div key={qi} className="mb-4">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              Q{qi + 1}. {q.question}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const showCorrect = result !== null && oi === q.correctIndex;
                const showWrong = result !== null && selected && oi !== q.correctIndex;
                return (
                  <button
                    key={oi}
                    disabled={result === 'pass'}
                    onClick={() => {
                      if (result !== null) return;
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className="text-left px-3 py-2 rounded-md border text-sm transition-all"
                    style={{
                      borderColor: showCorrect ? '#22c55e' : showWrong ? '#ef4444' : selected ? accent : '#e2e8f0',
                      background: showCorrect ? '#f0fdf4' : showWrong ? '#fef2f2' : selected ? `${accent}10` : 'white',
                      color: '#334155',
                      fontWeight: selected || showCorrect ? 600 : 400,
                      cursor: result === null ? 'pointer' : 'default',
                    }}
                  >
                    {showCorrect ? '✅ ' : showWrong ? '❌ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {result === null && (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full py-2.5 rounded-md text-sm font-bold text-white transition-opacity"
            style={{ background: accent, opacity: allAnswered ? 1 : 0.4, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
          >
            判定する
          </button>
        )}
        {result === 'pass' && (
          <div className="p-3 rounded-md text-sm font-semibold text-center" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
            🎉 合格！（{correctCount}/3 正解）次の戦争が解放されたばい
          </div>
        )}
        {result === 'fail' && (
          <div>
            <div className="p-3 mb-2 rounded-md text-sm text-center" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {correctCount}/3 正解——もう一度上の解説を読んでから再挑戦しよう
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-2.5 rounded-md text-sm font-bold border transition-colors"
              style={{ borderColor: accent, color: accent, background: 'white' }}
            >
              🔁 もう一度挑戦する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🗺️</div>
        <h1 className="text-2xl font-serif text-slate-900 mb-3">
          学習パスが見つかりません
        </h1>
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">
          指定された学習パスは存在しないか、移動されました。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
        >
          ← トップに戻る
        </Link>
      </div>
    </div>
  );
}

export default function LearnPathPage() {
  const params = useParams();
  const pathId = params?.pathId as string;
  const path = LEARNING_PATHS.find((p) => p.id === pathId);

  // 習熟度ゲート進捗（localStorage）
  const storageKey = `wc-path-progress-${pathId}`;
  const [passed, setPassed] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPassed(JSON.parse(saved));
    } catch { /* 続行 */ }
    setLoaded(true);
  }, [storageKey]);

  const markPassed = useCallback((warId: string) => {
    setPassed(prev => {
      const next = { ...prev, [warId]: true };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* 続行 */ }
      return next;
    });
  }, [storageKey]);

  const resetProgress = useCallback(() => {
    setPassed({});
    try { localStorage.removeItem(storageKey); } catch { /* 続行 */ }
  }, [storageKey]);

  if (!path) return <NotFoundView />;

  const wars: { war: War; index: number }[] = path.warIds
    .map((id, index) => {
      const war = WARS.find((w) => w.id === id);
      return war ? { war, index } : null;
    })
    .filter((x): x is { war: War; index: number } => x !== null);

  const total = path.warIds.length;
  const accent = path.accent;
  const passedCount = wars.filter(({ war }) => passed[war.id]).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ scrollBehavior: 'smooth' }}>
      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg tracking-tight text-slate-900 hover:text-slate-600 transition-colors"
          >
            War Chronicle
          </Link>
          <div className="flex items-center gap-4">
            {/* 進捗バー */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (passedCount / total) * 100 : 0}%`, background: accent }} />
              </div>
              <span className="text-xs text-slate-500 font-mono">{passedCount}/{total}</span>
            </div>
            <Link
              href="/#learning-paths"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← パス一覧
            </Link>
          </div>
        </div>
      </header>

      {/* ───────── Hero ───────── */}
      <section
        className="relative overflow-hidden border-b border-slate-200"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 50%, #0f172a 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
              backgroundSize: '60px 60px, 90px 90px',
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="text-7xl md:text-8xl mb-6">{path.emoji}</div>
          <div className="inline-block px-3 py-1 mb-6 text-xs tracking-widest uppercase bg-white/15 text-white/90 backdrop-blur rounded-sm border border-white/20">
            学習パス（習熟度ゲート式）
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
            {path.title}
          </h1>
          <p className="italic text-lg md:text-xl text-white/80 mb-6 font-light">
            {path.subtitle}
          </p>
          <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
            {path.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-white/60">所要時間</span>
              <span className="font-semibold text-white">
                約 {path.estimatedMinutes} 分
              </span>
            </div>
            <span className="text-white/40">／</span>
            <div className="flex items-center gap-2">
              <span className="text-white/60">構成</span>
              <span className="font-semibold text-white">{total} 本</span>
            </div>
            <span className="text-white/40">／</span>
            <div className="flex items-center gap-2">
              <span className="text-white/60">クリア</span>
              <span className="font-semibold text-white">{passedCount} 本</span>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-xs leading-relaxed max-w-xl">
            📖 各戦争を読んだあとの「理解度チェック」（3問中2問正解）で次が解放されます。
            読んだ直後に思い出す「検索練習」は、ただ読み返すより記憶への定着が約2倍高いことが実証されています。
          </p>
        </div>
      </section>

      {/* ───────── War sections ───────── */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-6">
          {wars.map(({ war }, idx) => {
            const isPassed = !!passed[war.id];
            const isUnlocked = idx === 0 || !!passed[wars[idx - 1].war.id];
            const content = WAR_CONTENT[war.id];
            const lessons = LESSONS[war.id];
            const background = truncatePlain(content?.digest?.background, 200);
            const modernLessons = truncateHtml(lessons?.modernLessons, 200);
            const yearRange =
              war.year === war.endYear ? `${war.year}年` : `${war.year}–${war.endYear}`;
            const region = REGIONS[war.region];

            return (
              <div key={war.id} className="relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className="absolute left-6 -top-6 h-6 w-px"
                    style={{ background: `${accent}40` }}
                    aria-hidden="true"
                  />
                )}

                {/* Progress counter */}
                <div className="flex items-center gap-3 mb-3 text-xs tracking-widest uppercase text-slate-500">
                  <span style={{ color: accent }} className="font-semibold">
                    {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                  {isPassed && <span className="text-green-600 font-semibold normal-case tracking-normal">✅ クリア済み</span>}
                  {!isUnlocked && <span className="text-slate-400 font-semibold normal-case tracking-normal">🔒 ロック中</span>}
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                {/* ロック中カード（コンパクト表示） */}
                {!isUnlocked && loaded ? (
                  <div className="relative bg-slate-100 border border-slate-200 rounded-lg p-6 select-none">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-slate-300 text-slate-500 shrink-0">
                        🔒
                      </div>
                      <div>
                        <h2 className="font-serif text-xl text-slate-400 leading-snug">{war.name}</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          前の戦争「{wars[idx - 1].war.name}」の理解度チェックに合格すると解放されます
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <article
                    className="group relative bg-white border border-slate-200 rounded-lg p-6 md:p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={
                      {
                        ['--accent' as never]: accent,
                        borderColor: isPassed ? '#86efac' : undefined,
                      } as React.CSSProperties
                    }
                  >
                    {/* Number badge */}
                    <div
                      className="absolute -left-3 -top-3 w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg text-white shadow-md"
                      style={{ background: isPassed ? '#16a34a' : accent }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="ml-6">
                      {/* Title row */}
                      <div className="flex flex-wrap items-baseline gap-3 mb-4">
                        <h2 className="font-serif text-2xl md:text-3xl text-slate-900 leading-snug">
                          {war.name}
                        </h2>
                        <span className="text-sm text-slate-500 font-mono">
                          {yearRange}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-sm border"
                          style={{
                            color: accent,
                            borderColor: `${accent}55`,
                            background: `${accent}0d`,
                          }}
                        >
                          {region}
                        </span>
                      </div>

                      {/* Background context */}
                      {background && (
                        <div className="mb-5">
                          <h3 className="text-xs tracking-widest uppercase text-slate-400 mb-2">
                            背景
                          </h3>
                          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                            {background}
                          </p>
                        </div>
                      )}

                      {/* Modern lessons / takeaway */}
                      {modernLessons && (
                        <div
                          className="mb-6 p-4 rounded-md border-l-4"
                          style={{
                            borderLeftColor: accent,
                            background: `${accent}08`,
                          }}
                        >
                          <h3
                            className="text-xs tracking-widest uppercase mb-2 font-semibold"
                            style={{ color: accent }}
                          >
                            現代への教訓
                          </h3>
                          <p
                            className="text-slate-700 leading-relaxed text-sm md:text-base"
                            dangerouslySetInnerHTML={{ __html: modernLessons }}
                          />
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href={`/explore?war=${war.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md border transition-all duration-200 hover:shadow"
                        style={{
                          color: accent,
                          borderColor: `${accent}55`,
                          background: 'white',
                        }}
                      >
                        詳しく読む
                        <span
                          className="transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>

                      {/* 理解度チェック（未クリアのみ） */}
                      {!isPassed && (
                        <>
                          <QuizBlock war={war} accent={accent} onPass={() => markPassed(war.id)} />
                          {idx < wars.length - 1 && (
                            <div className="mt-2 text-right">
                              <button
                                onClick={() => markPassed(war.id)}
                                className="text-xs text-slate-400 hover:text-slate-600 underline"
                              >
                                クイズをスキップして進む
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                )}

                {/* Down arrow connector */}
                {idx < wars.length - 1 && (
                  <div className="flex justify-center py-4" aria-hidden="true">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-px h-6"
                        style={{ background: `${accent}55` }}
                      />
                      <div
                        className="text-lg leading-none"
                        style={{ color: accent }}
                      >
                        ↓
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ───────── 完走バナー ───────── */}
        {passedCount === total && total > 0 && (
          <div className="mt-12 p-8 rounded-lg text-center border-2"
            style={{ borderColor: accent, background: `${accent}08` }}>
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="font-serif text-2xl text-slate-900 mb-2">パス完全制覇！</h2>
            <p className="text-sm text-slate-600 mb-4">
              全 {total} 戦争の理解度チェックをクリアしたばい。お見事！
            </p>
            <button
              onClick={resetProgress}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              進捗をリセットしてもう一周する
            </button>
          </div>
        )}

        {/* ───────── Footer CTA ───────── */}
        <section className="mt-20 pt-12 border-t border-slate-200">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">{path.emoji}</div>
            <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-2">
              読了お疲れさま
            </h2>
            <p className="text-slate-600 text-sm">
              次のステップ：他の戦争・他のパスへ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/explore"
              className="group block p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="text-xs tracking-widest uppercase text-slate-400 mb-2">
                Explore
              </div>
              <div className="font-serif text-lg text-slate-900 mb-1 group-hover:text-slate-700">
                全ての戦争を探索する
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                100戦争のマップ・年表
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/#learning-paths"
              className="group block p-6 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border"
              style={{
                background: `${accent}08`,
                borderColor: `${accent}33`,
              }}
            >
              <div
                className="text-xs tracking-widest uppercase mb-2"
                style={{ color: accent }}
              >
                Learning Paths
              </div>
              <div className="font-serif text-lg text-slate-900 mb-1">
                他の学習パス
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                別の切り口で歴史を辿る
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
