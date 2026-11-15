# WAR CHRONICLE（Claude Code 向けメモ）

## 何のアプリか
世界の戦争史を学べる日本語の Web サイト（年表・因果の大河・学習パス・フラッシュカード・AI 診断など）。

## 構成
- Next.js（App Router）+ TypeScript + Tailwind CSS。ページは `app/`、部品は `components/`
- データは `lib/` の TypeScript ファイルに直書き（`wars.ts`、`content*.ts`、`live-conflicts.ts` など）
- AI 診断は `app/api/diagnose`（Anthropic API を呼ぶ。キーは環境変数）

## ローカル起動と確認
- `npm ci` → `npm run dev`（http://localhost:3000）
- 型チェック: `npx tsc --noEmit`
- 本番ビルド確認: `npm run build`
- PR では `.github/workflows/ci.yml` が型チェックと build を自動実行する

## デプロイ
- GitHub の既定ブランチ（master）へ push／マージすると Vercel が自動デプロイする
- 環境変数は Vercel の管理画面で設定する（値はコミットしない）

## 注意点
- 進行中の紛争データ（`lib/live-conflicts.ts`、`lib/content-updates-2026.ts`）は自動更新されない。人が見直して `LIVE_DATA_REVIEWED` を更新する
- `.github/workflows/update-live-data.yml` は見直し期限切れを Issue で知らせるだけ
- `.env*` と API キーは開かない・コミットしない
- 有料 API（Anthropic）を呼ぶ `/api/diagnose` はテストで叩かない
