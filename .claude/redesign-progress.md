# WAR CHRONICLE 全体リデザイン — 進捗ファイル

自動再開（CronCreate 毎時:17頃）のたびに、このファイルを読んで「次にやること」から再開する。
作業ブランチ: `redesign-2026-10`（ローカルのみ。push/本番デプロイはユーザー承認後）
レビュー結果と方針: `docs/redesign-review.md`
dev server: `C:\Users\user\Desktop\.claude\launch.json` の "war-chronicle"（port 3200）。preview_start {name:"war-chronicle"}

## ルール
- 1フェーズ終わるごとに commit（チェックポイント）。このファイルも更新する。
- push / Vercel 本番反映はしない（最後にユーザーへ確認）。
- master には GitHub Actions が毎週 live-conflicts.ts のタイムスタンプを commit してくる → 最後に merge で取り込む（衝突したら自分の版を優先）。
- 全部終わったら CronList → CronDelete で自動再開ジョブを止める。
- `npm run build` は dev server と .next を共有するので、build 前に preview_stop する。

## フェーズ
- [x] P0 現状把握
- [x] P1 レビュー結果と改修方針 → docs/redesign-review.md
- [x] P2 基盤：トークン(CSS変数)・Noto JPフォント(next/font)・zoom撤去＋fontSize是正・共通 SiteHeader/SiteFooter（5グループナビ＋スマホメニュー）を全ページに適用。/learn /themes /religions 一覧新設（commit 3e86923）
  - 共通部品: globals.css に .container .page-hero .eyebrow .section .section-head .btn .card .chip .tag .prose-jp .input .feature-card .card-grid
  - lib/site.ts（サーバー専用の数値）, lib/nav.ts（ナビ定義）, lib/text.ts（stripHtml/firstSentence/formatPeriod）
  - smoke test: scratchpad/smoke.sh（無ければ全ルートを curl で 200 確認）
- [x] P3 戦争ページ `/wars/[id]`（SSG）＋ `/explore?war=` 308転送＋タブのハッシュ連動・前後ナビ・パンくず＋探索画面作り直し（components/explore/）＋戦争一覧 `/wars`（サーバー側フィルタ）。DetailDrawer/SearchModal/旧Timeline/WantaBubble 削除。CompareModal は components/_legacy-CompareModal.tsx.txt に退避 → P6 で /compare ページとして作り直す
- [x] P4 トップ再設計（サーバー描画・3つの入口・いま続いている戦争・構造パターン一覧・編集方針）。Hero/TagCloud 削除、styles/home.css
- [x] P5 内容是正：ライブデータを2026年10月時点に更新（イラン戦争2026を追加）、lib/content-updates-2026.ts で継続中戦争の本文に最新状況を重ねる、ongoing フラグ（11件）、ビルマ独立戦争の終了年修正、日付だけ更新するActionを廃止→鮮度チェックIssue方式、/live を出典・基準時点つきで作り直し（根拠のない世界合計の数字を削除）、学習パス内容修正、件数表記の統一
  - 残り（P6で各ページ作業時に対応）：C4 教訓一覧の再現性統計撤去 / C5 宗教ページの生HTML / C7 地の文の方言（わんたの台詞以外は標準語に）/ chronicle の「176」直書き / 各ページの年表示を formatPeriod に
- [x] P6 各ページ磨き込み：全ページをサーバー描画＋共通デザインに作り直し（chronicle/patterns/chains/lessons/search/learn/themes/religions/wanta/flashcards/diagnose/risk-check/live）、/compare 新設、/network 廃止（→/chains へ308）、/api/generate 削除、診断APIは構造化出力＋収録戦争IDに限定（ローカルのAPIキーが無効で実呼び出しは未検証）
- [ ] P7 SEO：ページ別 metadata（route layout.tsx）、sitemap.ts、robots.ts
- [ ] P8 QA：build、モバイル、全ルート確認、master merge、ユーザーへ報告、Cron削除

## 次にやること
P7 SEO（sitemap.ts / robots.ts / OG、SITE_URL を Vercel の実ドメインに）→ P8 QA（npm run build はプレビュー停止後に）。※スクショは Browser pane が隠れていると失敗するので javascript_tool で検証する。

## ログ
- 2026-10-20 開始。master を pull（timestamp commit 17件）、ブランチ作成。lib/causal-chains.ts の未コミット修正（イタリア→ドイツ統一の接続文の史実修正）は妥当なので維持。
- 2026-10-20 P0/P1 完了。
