import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div className="container-read">
          <div className="eyebrow">404</div>
          <h1>ページが見つかりません</h1>
          <p className="lead">お探しのページは移動したか、存在しないようです。以下から探してみてください。</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <Link href="/" className="btn btn--primary">ホームへ</Link>
            <Link href="/wars" className="btn btn--ghost-dark">戦争一覧</Link>
            <Link href="/search" className="btn btn--ghost-dark">全文検索</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
