import type { Metadata } from 'next';
import LearningPathCard from '@/components/LearningPathCard';
import { LEARNING_PATHS } from '@/lib/learning-paths';

export const metadata: Metadata = {
  title: '学習パス',
  description: 'どこから読めばいいか迷ったら。20世紀・現代中国・中東・冷戦・戦争の起き方を、決められた順番で読み進める学習パス。',
};

export default function LearnIndexPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Learning Paths</div>
          <h1>学習パス</h1>
          <p className="lead">
            「どこから読めばいい？」に答える、テーマ別の読み順です。1本あたり5〜10の戦争を順番に読み、
            各戦争の終わりにある理解度チェックで、つながりを確かめながら進めます。
          </p>
        </div>
      </section>
      <section className="section--tight">
        <div className="container">
          <div className="card-grid">
            {LEARNING_PATHS.map((p) => (
              <LearningPathCard key={p.id} path={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
