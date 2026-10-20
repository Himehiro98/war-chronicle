import type { Metadata } from 'next';
import DiagnoseView from '@/components/practice/DiagnoseView';
import { WAR_COUNT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AIパターン診断',
  description: 'いま起きている出来事や状況を入力すると、構造的に似ている過去の戦争をAIが探し、注意すべき類似点を示します。',
};

export default function DiagnosePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container-read">
          <div className="eyebrow">AI Pattern Check</div>
          <h1>AIパターン診断</h1>
          <p className="lead">
            ニュースで見た出来事や、気になる地域の状況を文章で入力してください。AIがこのサイトに収録された{WAR_COUNT}の戦争と照らし合わせ、
            構造的に似ている戦争と、注意すべき類似点を示します。
          </p>
        </div>
      </section>
      <div className="container-read practice-body">
        <DiagnoseView />
      </div>
    </main>
  );
}
