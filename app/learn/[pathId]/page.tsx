'use client';

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
 * シンプルにテキスト総量で判定
 */
function truncateHtml(text: string | undefined, max: number): string {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '');
  if (plain.length <= max) return text;
  // タグを保ったまま、プレーン文字数で max まで切る
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

  if (!path) return <NotFoundView />;

  const wars: { war: War; index: number }[] = path.warIds
    .map((id, index) => {
      const war = WARS.find((w) => w.id === id);
      return war ? { war, index } : null;
    })
    .filter((x): x is { war: War; index: number } => x !== null);

  const total = path.warIds.length;
  const accent = path.accent;

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
          <Link
            href="/#learning-paths"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← パス一覧
          </Link>
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
            学習パス
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
          </div>
        </div>
      </section>

      {/* ───────── War sections ───────── */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-6">
          {wars.map(({ war }, idx) => {
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
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                <article
                  className="group relative bg-white border border-slate-200 rounded-lg p-6 md:p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={
                    {
                      ['--accent' as never]: accent,
                    } as React.CSSProperties
                  }
                >
                  {/* Number badge */}
                  <div
                    className="absolute -left-3 -top-3 w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg text-white shadow-md"
                    style={{ background: accent }}
                  >
                    {idx + 1}
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
                  </div>
                </article>

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
