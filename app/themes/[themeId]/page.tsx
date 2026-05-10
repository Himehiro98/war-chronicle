import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MODERN_THEMES } from '@/lib/modern-themes';
import { WARS, REGIONS } from '@/lib/wars';
import { WAR_CONTENT } from '@/lib/content';
import { LESSONS } from '@/lib/lessons';

export function generateStaticParams() {
  return MODERN_THEMES.map((t) => ({ themeId: t.id }));
}

export default function ThemePage({ params }: { params: { themeId: string } }) {
  const theme = MODERN_THEMES.find((t) => t.id === params.themeId);

  if (!theme) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3">
          テーマが見つかりません
        </h1>
        <p className="text-slate-600 mb-8">
          指定された ID「{params.themeId}」のテーマは存在しないばい。
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition"
        >
          ← トップページに戻る
        </Link>
      </div>
    );
  }

  const accent = theme.accent;

  // 関連戦争データ取得
  const relatedWars = theme.keyWarIds
    .map((id) => {
      const war = WARS.find((w) => w.id === id);
      if (!war) return null;
      const content = WAR_CONTENT[id];
      const lesson = LESSONS[id];
      const snippet =
        content?.digest?.background ||
        content?.detail?.lead ||
        lesson?.commonalities ||
        'この戦争の詳細はリンク先で読める。';
      return { war, snippet };
    })
    .filter((x): x is { war: (typeof WARS)[number]; snippet: string } => x !== null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-lg tracking-wide hover:text-amber-300 transition">
            War Chronicle
          </Link>
          <Link
            href="/#modern-themes"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            ← テーマ一覧
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-slate-800"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, ${accent}30 100%)`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${accent}80, transparent 60%)`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">
          <div className="text-7xl md:text-8xl mb-6 select-none">{theme.emoji}</div>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{
              backgroundColor: `${accent}25`,
              color: accent,
              border: `1px solid ${accent}60`,
            }}
          >
            現代の問い
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-8"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.15 }}
          >
            {theme.question}
          </h1>
          <p
            className="italic text-slate-200 max-w-3xl"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 1.7 }}
          >
            {theme.shortAnswer}
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* 歴史的背景 */}
        <section>
          <div
            className="bg-white rounded-lg shadow-sm p-8 md:p-10"
            style={{ borderLeft: `6px solid ${accent}` }}
          >
            <h2 className="font-serif font-bold text-3xl text-slate-900 mb-6">
              歴史的背景
            </h2>
            <p
              className="text-slate-700 text-lg"
              style={{ lineHeight: 1.85 }}
            >
              {theme.background}
            </p>
          </div>
        </section>

        {/* 重要概念 */}
        <section>
          <h2 className="font-serif font-bold text-3xl text-slate-900 mb-2">
            重要概念
          </h2>
          <p className="text-slate-500 mb-8">このテーマを読み解く鍵となるキーワード</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {theme.keyConcepts.map((concept, i) => (
              <div
                key={concept}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border border-slate-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {concept}
                  </h3>
                </div>
                <p
                  className="text-sm text-slate-600"
                  style={{ lineHeight: 1.75 }}
                >
                  詳細は関連戦争を参照。各戦争の構造分析と教訓セクションで、この概念の作動メカニズムが読める。
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 関連戦争 */}
        <section>
          <h2 className="font-serif font-bold text-3xl text-slate-900 mb-2">
            関連戦争で読み解く
          </h2>
          <p className="text-slate-500 mb-10">
            このテーマの歴史的構造を形作った戦争を、年代順にたどる
          </p>

          <div className="relative pl-10">
            {/* 縦線 */}
            <div
              aria-hidden
              className="absolute left-3 top-2 bottom-2 w-0.5"
              style={{ backgroundColor: `${accent}40` }}
            />
            <div className="space-y-8">
              {relatedWars.map(({ war, snippet }) => (
                <div key={war.id} className="relative">
                  {/* dot */}
                  <div
                    aria-hidden
                    className="absolute -left-[34px] top-6 w-4 h-4 rounded-full ring-4 ring-slate-50"
                    style={{ backgroundColor: accent }}
                  />
                  <article className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-7 hover:shadow-md transition">
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="font-serif font-bold text-2xl text-slate-900">
                        {war.name}
                      </h3>
                      <span className="text-sm text-slate-500 font-mono">
                        {war.year}–{war.endYear}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${accent}15`,
                          color: accent,
                        }}
                      >
                        {REGIONS[war.region]}
                      </span>
                    </div>
                    <p
                      className="text-slate-700 mb-5"
                      style={{ lineHeight: 1.85 }}
                    >
                      {snippet.length > 240 ? snippet.slice(0, 240) + '…' : snippet}
                    </p>
                    <Link
                      href={`/explore?war=${war.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold hover:underline"
                      style={{ color: accent }}
                    >
                      この戦争を詳しく読む →
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 現代の状況 */}
        <section>
          <div
            className="rounded-lg p-8 md:p-10 shadow-sm relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${accent}08 100%)`,
              border: `1px solid ${accent}30`,
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
              }}
            />
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                NOW
              </span>
              <h2 className="font-serif font-bold text-3xl text-slate-900">
                現代の状況
              </h2>
            </div>
            <p
              className="text-slate-700 text-lg"
              style={{ lineHeight: 1.85 }}
            >
              {theme.modernSituation}
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <span className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-0.5">
                重要
              </span>
              <p style={{ lineHeight: 1.8 }}>
                歴史的背景の理解は、現在の侵略や暴力を正当化するものではありません。複数の解釈を並列に置き、単純善悪化を避ける姿勢が本クロニクルの基本です。
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTAs */}
        <section className="pt-8 border-t border-slate-200">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/#modern-themes"
              className="block bg-white border border-slate-300 rounded-lg p-6 hover:border-slate-900 hover:shadow-md transition group"
            >
              <div className="text-xs text-slate-500 mb-1 tracking-widest uppercase">
                テーマ
              </div>
              <div className="font-serif font-bold text-lg text-slate-900 group-hover:underline">
                他のテーマを見る →
              </div>
            </Link>
            <Link
              href="/explore"
              className="block rounded-lg p-6 text-white hover:shadow-lg transition group"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="text-xs text-slate-400 mb-1 tracking-widest uppercase">
                探索
              </div>
              <div className="font-serif font-bold text-lg group-hover:underline">
                全ての戦争を探索 →
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-500">
        <p>War Chronicle — 過去から現代を読み解く</p>
      </footer>
    </div>
  );
}
