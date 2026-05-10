'use client';

import { useState } from 'react';
import Link from 'next/link';
import CausalityGraph from '@/components/CausalityGraph';

const ERA_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'early-modern', label: '近世' },
  { value: '20th-century', label: '20世紀' },
  { value: 'contemporary', label: '現代' },
];

const TAG_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'ナショナリズム', label: 'ナショナリズム' },
  { value: '経済危機', label: '経済危機' },
  { value: '安全保障ジレンマ', label: '安全保障ジレンマ' },
  { value: '資源争奪', label: '資源争奪' },
  { value: '帝国衰退', label: '帝国衰退' },
  { value: '宗教対立', label: '宗教対立' },
  { value: '革命', label: '革命' },
  { value: '同盟暴走', label: '同盟暴走' },
  { value: '冷戦構造', label: '冷戦構造' },
  { value: '植民地解放', label: '植民地解放' },
  { value: '誤算・誤認知', label: '誤算・誤認知' },
];

const REGION_LEGEND: { color: string; label: string }[] = [
  { color: '#1e40af', label: '欧州' },
  { color: '#0891b2', label: 'アジア' },
  { color: '#b45309', label: '中東・アフリカ' },
  { color: '#7c3aed', label: '南北米' },
];

export default function NetworkPage() {
  const [era, setEra] = useState<string>('all');
  const [tag, setTag] = useState<string>('all');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-slate-50 border-b border-slate-700 shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-wide text-lg hover:text-amber-300 transition">
            War Chronicle
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-amber-300 transition">
            ← ホームへ
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title & description */}
        <section className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            戦争の因果ネットワーク
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-3xl">
            ある戦争が、次のどの戦争の原因になったのか。歴史を点ではなく線として見る。
          </p>
        </section>

        {/* Filters */}
        <section className="mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              時代
            </label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {ERA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              構造タグ
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {TAG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEra('all');
              setTag('all');
            }}
            className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 transition"
          >
            リセット
          </button>
        </section>

        {/* Graph */}
        <section className="mb-8" style={{ height: '70vh' }}>
          <CausalityGraph filterEra={era} filterTag={tag} />
        </section>

        {/* Legend */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">地域（色）</h3>
            <div className="flex flex-wrap gap-3">
              {REGION_LEGEND.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-xs text-slate-600">
                  <span
                    className="inline-block w-4 h-4 rounded"
                    style={{ background: r.color }}
                  />
                  {r.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">重み（サイズ）</h3>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <span className="inline-block bg-slate-700 rounded" style={{ width: 36, height: 14 }} />
                <span>大 = 世界秩序級</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block bg-slate-700 rounded" style={{ width: 26, height: 12 }} />
                <span>中 = 地域秩序</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block bg-slate-700 rounded" style={{ width: 18, height: 10 }} />
                <span>小 = 内戦・代理</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">矢印（因 → 果）</h3>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg width="80" height="20">
                <defs>
                  <marker id="arrow-legend" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
                  </marker>
                </defs>
                <line x1="2" y1="10" x2="70" y2="10" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-legend)" />
              </svg>
              <span>因 が 果 を引き起こす</span>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <footer className="border-t border-slate-200 pt-6 pb-12">
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            因果関係は歴史家のコンセンサスがある明確なものに限る。文化・思想的影響の多くは表現されない。
          </p>
        </footer>
      </main>
    </div>
  );
}
