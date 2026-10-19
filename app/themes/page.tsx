import type { Metadata } from 'next';
import ThemeCard from '@/components/ThemeCard';
import { MODERN_THEMES } from '@/lib/modern-themes';

export const metadata: Metadata = {
  title: '現代の問い',
  description: '「なぜロシアはNATOを恐れるのか」「なぜ台湾問題が起きるのか」——現代の問いから出発して、過去の戦争の積み重ねとして読み解く。',
};

export default function ThemesIndexPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Modern Questions</div>
          <h1>現代の問いから歴史を読む</h1>
          <p className="lead">
            ニュースで見る対立の多くは、過去の戦争・植民地支配・冷戦構造が積み重なった結果です。
            現代の具体的な問いから出発し、その背景にある戦争をたどります。
          </p>
        </div>
      </section>
      <section className="section--tight">
        <div className="container">
          <div className="card-grid">
            {MODERN_THEMES.map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
