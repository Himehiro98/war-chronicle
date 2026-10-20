'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { QuizQ } from '@/lib/quiz';

/** 学習パスの進捗（localStorage）。ロックはせず、チェックの合格を記録するだけ */
type Ctx = { passed: Record<string, boolean>; mark: (id: string) => void; reset: () => void; total: number };
const ProgressCtx = createContext<Ctx>({ passed: {}, mark: () => {}, reset: () => {}, total: 0 });

export function PathProgressProvider({ pathId, total, children }: { pathId: string; total: number; children: React.ReactNode }) {
  const key = `wc-path-progress-${pathId}`;
  const [passed, setPassed] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setPassed(JSON.parse(s)); } catch { /* noop */ }
  }, [key]);
  const mark = useCallback((id: string) => {
    setPassed((prev) => {
      const next = { ...prev, [id]: true };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  const reset = useCallback(() => {
    setPassed({});
    try { localStorage.removeItem(key); } catch { /* noop */ }
  }, [key]);
  return <ProgressCtx.Provider value={{ passed, mark, reset, total }}>{children}</ProgressCtx.Provider>;
}

export function ProgressBar() {
  const { passed, total, reset } = useContext(ProgressCtx);
  const n = Object.values(passed).filter(Boolean).length;
  return (
    <div className="path-progress" aria-label={`理解度チェック ${n}/${total}`}>
      <span className="path-progress__label">理解度チェック</span>
      <span className="path-progress__track"><span style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></span>
      <span className="path-progress__count">{n}/{total}</span>
      {n === total && total > 0 && (
        <button type="button" className="path-progress__reset" onClick={reset}>リセット</button>
      )}
    </div>
  );
}

export function PassedBadge({ warId }: { warId: string }) {
  const { passed } = useContext(ProgressCtx);
  return passed[warId] ? <span className="path-step__passed">チェック済み</span> : null;
}

export function Quiz({ warId, quiz }: { warId: string; quiz: QuizQ[] }) {
  const { passed, mark } = useContext(ProgressCtx);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [checked, setChecked] = useState(false);
  const correct = answers.filter((a, i) => a === quiz[i].correctIndex).length;
  const need = Math.ceil(quiz.length * 0.6);

  if (passed[warId] && !checked) {
    return <p className="quiz__done">理解度チェック合格済み</p>;
  }

  return (
    <details className="quiz">
      <summary>理解度チェック（{quiz.length}問）に挑戦する</summary>
      <div className="quiz__body">
        {quiz.map((q, qi) => (
          <fieldset key={qi} className="quiz__q">
            <legend>Q{qi + 1}. {q.question}</legend>
            <div className="quiz__opts">
              {q.options.map((opt, oi) => {
                const sel = answers[qi] === oi;
                const state = checked ? (oi === q.correctIndex ? ' is-correct' : sel ? ' is-wrong' : '') : sel ? ' is-selected' : '';
                return (
                  <button key={oi} type="button" className={`quiz__opt${state}`} aria-pressed={sel}
                    disabled={checked}
                    onClick={() => setAnswers((prev) => { const next = [...prev]; next[qi] = oi; return next; })}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {!checked ? (
          <button type="button" className="btn btn--accent btn--sm" disabled={answers.some((a) => a === null)}
            onClick={() => { setChecked(true); if (correct >= need) mark(warId); }}>
            答え合わせ
          </button>
        ) : (
          <div className={`quiz__result${correct >= need ? ' is-pass' : ''}`}>
            {quiz.length}問中{correct}問正解。{correct >= need ? '合格です。次の戦争へ進みましょう。' : '解説を読み直して、もう一度挑戦してみてください。'}
            {correct < need && (
              <button type="button" className="btn btn--ghost btn--sm" style={{ marginLeft: 10 }}
                onClick={() => { setAnswers(quiz.map(() => null)); setChecked(false); }}>
                もう一度
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
