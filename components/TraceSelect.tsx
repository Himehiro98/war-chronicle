'use client';

import { useRouter } from 'next/navigation';

/** 選んだら即座に ?war= を切り替えるセレクト（JS無効時はボタンで送信） */
export default function TraceSelect({ options, value }: { options: { id: string; label: string }[]; value: string }) {
  const router = useRouter();
  return (
    <form action="/chains" method="get" className="trace-select" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="trace-war" className="sr-only">起点にする戦争</label>
      <select
        id="trace-war"
        name="war"
        className="input"
        defaultValue={value}
        onChange={(e) => router.push(`/chains?war=${e.target.value}#tracer`, { scroll: false })}
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <noscript><button type="submit" className="btn btn--ghost btn--sm">表示</button></noscript>
    </form>
  );
}
