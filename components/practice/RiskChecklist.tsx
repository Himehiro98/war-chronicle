'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { WarTag } from '@/lib/types';

export interface RiskWar {
  id: string;
  name: string;
  period: string;
  tags: WarTag[];
  weight: number;
  lesson: string;
}

interface CheckItem { id: string; label: string; tag: WarTag; category: string }

const CATEGORIES = [
  { id: 'power', title: '権力構造の揺らぎ' },
  { id: 'social', title: '社会・経済の圧力' },
  { id: 'security', title: '安全保障の構造' },
];

const ITEMS: CheckItem[] = [
  { id: 'p1', label: '既存の大国が急速に衰えている', tag: '帝国衰退', category: 'power' },
  { id: 'p2', label: '統治が及ばない「空白」の地域が生まれている', tag: '権力真空', category: 'power' },
  { id: 'p3', label: '指導者が国内で政治的な危機に直面している', tag: '指導者個人要因', category: 'power' },
  { id: 'p4', label: '政府の正統性が揺らいでいる（革命・クーデターの兆し）', tag: '革命', category: 'power' },
  { id: 's1', label: '経済危機・急なインフレ・失業の増加がある', tag: '経済危機', category: 'social' },
  { id: 's2', label: '特定の民族・宗教集団への差別や排除が目立ってきた', tag: '民族浄化', category: 'social' },
  { id: 's3', label: '「外の敵」が国内の団結に利用されている', tag: 'ナショナリズム', category: 'social' },
  { id: 's4', label: '石油・水・土地などの資源をめぐる争いがある', tag: '資源争奪', category: 'social' },
  { id: 'x1', label: '相手の意図を読み違えている兆候がある', tag: '誤算・誤認知', category: 'security' },
  { id: 'x2', label: '同盟の義務が自動的な参戦につながりうる', tag: '同盟暴走', category: 'security' },
  { id: 'x3', label: '互いに軍備を増強し合っている', tag: '安全保障ジレンマ', category: 'security' },
  { id: 'x4', label: 'プロパガンダや偽情報が広まっている', tag: '情報戦・プロパガンダ', category: 'security' },
  { id: 'x5', label: '宗教や文明の違いが政治的に利用されている', tag: '宗教対立', category: 'security' },
];

const WHY: Partial<Record<WarTag, string>> = {
  '同盟暴走': '局地的な紛争が同盟の連鎖で大戦に広がる。第一次世界大戦の典型。',
  '誤算・誤認知': '「相手は折れる」と読み違えて開戦する。キューバ危機など冷戦期にも繰り返された。',
  '帝国衰退': '衰えつつある大国ほど「今しかない」と先制に踏み切りやすい。',
  '経済危機': '国内の不満のはけ口として、外への攻撃性が高まる。1930年代の教訓。',
  '権力真空': '秩序が崩れた地域には複数の勢力が流れ込み、偶発的な衝突が起きやすい。',
  '情報戦・プロパガンダ': '戦争支持の世論がつくられ、指導者が引き返せなくなる。',
  'ナショナリズム': '「我々と彼ら」の構図が固まると、外交上の妥協が国内政治的に難しくなる。',
  '指導者個人要因': '孤立した指導者は、合理的な判断より自らの生き残りで動きやすい。',
  '安全保障ジレンマ': '一方の防衛強化が他方には脅威に映り、不信が連鎖する。',
  '民族浄化': '排除の言説が段階的に暴力を正当化していく。',
  '資源争奪': '生存に直結する資源は妥協の余地が小さい。',
  '革命': '体制の転換期には外交の約束が機能しにくく、周辺国が介入しやすい。',
  '宗教対立': '聖地や正統性をめぐる対立は物質的な妥協が難しく、長期化しやすい。',
};
const PRIORITY: WarTag[] = ['同盟暴走', '誤算・誤認知', '帝国衰退', '経済危機', '権力真空', '情報戦・プロパガンダ'];

export default function RiskChecklist({ wars }: { wars: RiskWar[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const tags = useMemo(() => ITEMS.filter((i) => checked.has(i.id)).map((i) => i.tag), [checked]);
  const matches = useMemo(() => {
    if (tags.length === 0) return [];
    return wars
      .map((w) => ({ w, hit: w.tags.filter((t) => tags.includes(t)) }))
      .filter((m) => m.hit.length > 0)
      .sort((a, b) => b.hit.length - a.hit.length || b.w.weight - a.w.weight)
      .slice(0, 5);
  }, [tags, wars]);
  const dangers = [...tags].sort((a, b) => (PRIORITY.indexOf(a) + 1 || 99) - (PRIORITY.indexOf(b) + 1 || 99)).slice(0, 2);
  const n = checked.size;
  const level = n === 0 ? null : n <= 3 ? '一部の条件が見られます' : n <= 7 ? '複数の条件が重なっています' : '多くの条件が重なっています';

  return (
    <div className="risk">
      <div className="risk__grid">
        <div>
          {CATEGORIES.map((c) => (
            <fieldset key={c.id} className="card risk__group">
              <legend>{c.title}</legend>
              {ITEMS.filter((i) => i.category === c.id).map((i) => (
                <label key={i.id} className={`risk__item${checked.has(i.id) ? ' is-checked' : ''}`}>
                  <input type="checkbox" checked={checked.has(i.id)} onChange={() => toggle(i.id)} />
                  <span>{i.label}<span className="risk__tag">{i.tag}</span></span>
                </label>
              ))}
            </fieldset>
          ))}
          {n > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setChecked(new Set())}>チェックをすべて外す</button>}
        </div>

        <aside className="risk__side">
          <div className="card risk__meter">
            <div className="risk__count"><strong>{n}</strong> / {ITEMS.length} 項目</div>
            <div className="risk__bar"><span style={{ width: `${(n / ITEMS.length) * 100}%` }} /></div>
            <p>{level ?? '思い浮かべた国や地域について、当てはまる項目にチェックしてください。'}</p>
          </div>

          {dangers.length > 0 && (
            <div className="card risk__panel">
              <h2>とくに注意したい条件</h2>
              {dangers.map((t) => (
                <div key={t} className="risk__danger"><strong>{t}</strong><p>{WHY[t]}</p></div>
              ))}
            </div>
          )}

          {matches.length > 0 && (
            <div className="card risk__panel">
              <h2>同じ条件が揃っていた戦争</h2>
              <ol className="risk__matches">
                {matches.map(({ w, hit }) => (
                  <li key={w.id}>
                    <Link href={`/wars/${w.id}`}>{w.name}</Link>
                    <span className="muted">{w.period}・一致 {hit.length}</span>
                  </li>
                ))}
              </ol>
              {matches[0].w.lesson && (
                <div className="risk__lesson">
                  <div>「{matches[0].w.name}」の教訓</div>
                  <p>{matches[0].w.lesson}</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 20 }}>
        このチェックリストは、過去の戦争に共通する条件を知るための学習用ツールです。項目の数は戦争の確率を示すものではなく、予測にも使えません。
      </p>
    </div>
  );
}
