# unite-roulette — AI エージェント向けガイド

ポケモンユナイトのチーム編成（ポケモン＋技構成）をランダム抽選するWebアプリ。

- **状態**: 🛠 MVP
- **種別**: Web（React + TypeScript + Vite）
- **リポジトリ**: 個人アカウント `yoshi-0102-tech`（→ [ワークスペースREADME](../../README.md) の「GitHubアカウントの使い分け」参照）

## 技術スタック

- 言語/ランタイム: TypeScript / React 19 / Vite / Node.js 22+
- 主要ライブラリ: React のみ（抽選・保存は標準APIで自作、外部依存なし）
- パッケージ管理: npm

## コマンド（コピペで動くもの）

```bash
npm install        # セットアップ
npm run dev        # 開発サーバー（http://localhost:5173）
npm run build      # 本番ビルド（tsc -b && vite build）
npx tsc -b         # 型チェックのみ
```

テスト: 正式なテストランナーは未導入。抽選ロジックは純粋関数なので
`node --experimental-strip-types` で単発検証できる（`src/lib/draw.ts` を import）。

## 構成（入口と主要ファイル）

- **入口**: `src/App.tsx` … ポケモン一覧の state を1か所で持ち、タブで画面を出し分ける
- **抽選ロジック**: `src/lib/draw.ts` … `drawTeam()`。画面から独立した純粋関数
- **保存**: `src/lib/storage.ts` … localStorage 読み書き＋JSON入出力
- **型**: `src/data/types.ts` / **初期データ**: `src/data/pokemon.ts`

## 規約・方針

- **抽選ロジックは純粋関数に保つ**（`lib/draw.ts` は DOM/React に依存しない）。テストしやすさのため。
- 変更後は `npx tsc -b` が通ることを確認する。
- コンポーネントは `components/` に、ロジックは `lib/` に分ける。

## 地雷・非自明な前提

- **データの正はブラウザの localStorage**（キー: `unite-roulette:pokemon`）。
  `SEED_POKEMON` はあくまで初期値／リセット先。ユーザーの編集内容が優先される。
- localStorage が空 or 壊れている場合は `SEED_POKEMON` にフォールバック。
  読み込み時は `storage.ts` の `sanitize()` で検証してから使う（不正JSONで落ちない設計）。
- **初期データの技名は最新アプデと差異があり得る**。正確性の担保はユーザーの編集画面に委ねている。
- 抽選演出のタイマーは `Roulette.tsx` の `intervalRef` / `timeoutsRef` で管理。
  新規抽選・アンマウント時に `clearTimers()` で必ず止める（消し忘れると多重に走る）。

## Git / コミット規約

- Conventional Commits（日本語要約）: `feat: 抽選演出を追加` など。
- push 先は必ず `git@github-personal:...`（素の `github.com` は仕事鍵）。
- コミットしない: `node_modules/`、`dist/`（`.gitignore` 済み）。
