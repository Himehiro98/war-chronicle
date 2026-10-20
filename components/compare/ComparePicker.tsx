'use client';

import { useRouter } from 'next/navigation';

/** 比較する戦争（最大3件）を選ぶ。選択は URL の ?w= に保持する */
export default function ComparePicker({ selected, options }: { selected: string[]; options: { id: string; label: string }[] }) {
  const router = useRouter();
  const go = (ids: string[]) => router.push(`/compare?w=${ids.filter(Boolean).join(',')}`, { scroll: false });
  const slots = selected.length < 3 ? [...selected, ''] : selected;

  return (
    <div className="compare-picker">
      {slots.map((id, i) => (
        <div key={`${i}-${id}`} className="compare-picker__slot">
          <label className="sr-only" htmlFor={`cmp-${i}`}>{i + 1}つ目の戦争</label>
          <select
            id={`cmp-${i}`}
            className="input"
            defaultValue={id}
            onChange={(e) => {
              const next = [...selected];
              next[i] = e.target.value;
              go(next);
            }}
          >
            <option value="">{id ? '（外す）' : '＋ 戦争を追加'}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={selected.includes(o.id) && o.id !== id}>{o.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
