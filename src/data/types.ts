// ポケモンユナイトのデータ構造を表す「型」を定義するファイル。
// 型を先に決めておくと、TypeScript が入力ミスをエディタ上で教えてくれる。

/** ロール（役割）。ユナイトの5種類。 */
export type Role =
  | "アタック"
  | "ディフェンス"
  | "バランス"
  | "スピード"
  | "サポート";

/** 全ロールを配列でも持っておく（プルダウンやループで使う）。 */
export const ROLES: Role[] = [
  "アタック",
  "ディフェンス",
  "バランス",
  "スピード",
  "サポート",
];

/**
 * ポケモン1体分のデータ。
 * - move1 / move2 はそれぞれ「わざ枠」で、中身は2択（string の配列）。
 *   例: move1 = ["でんじは", "エレキボール"]
 */
export type Pokemon = {
  id: string; // 一意なID（重複しない目印）
  name: string; // ポケモン名
  role: Role; // ロール
  move1: string[]; // わざ1の選択肢（ふつう2つ）
  move2: string[]; // わざ2の選択肢（ふつう2つ）
};

/** 抽選1件の結果。どのポケモンで、どの技に決まったか。 */
export type DrawResult = {
  pokemon: Pokemon;
  chosenMove1: string;
  chosenMove2: string;
};

/**
 * 各プレイヤー枠の「しばり」。
 * - "any" ならどのロールでもOK（おまかせ）
 * - Role を指定するとそのロールの中から抽選
 */
export type SlotConstraint = Role | "any";
