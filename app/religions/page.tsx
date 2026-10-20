import type { Metadata } from 'next';
import ReligionCard from '@/components/ReligionCard';
import { RELIGION_THEMES } from '@/lib/religion-themes';

export const metadata: Metadata = {
  title: '宗教から読む',
  description: 'ユダヤ教・キリスト教・イスラム教・ヒンドゥー教・仏教。主要5宗教を軸に、戦争史を読み解く。',
};

export default function ReligionsIndexPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">History through Religion</div>
          <h1>宗教から歴史を読み解く</h1>
          <p className="lead">
            宗教は戦争の「原因」なのか、それとも戦争を語るための「言葉」なのか。
            主要5宗教それぞれの成り立ちと、関わってきた戦争を時代順にたどります。
            特定の信仰を評価するものではなく、社会・政治・地政学と重なり合う現象として扱います。
          </p>
        </div>
      </section>
      <section className="section--tight">
        <div className="container">
          <div className="card-grid">
            {RELIGION_THEMES.map((t) => (
              <ReligionCard key={t.id} theme={t} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
