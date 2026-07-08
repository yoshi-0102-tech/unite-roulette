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
  move1: string[]; // わざ1の選択肢（1つなら固定、2つ以上なら抽選）
  move2: string[]; // わざ2の選択肢（同上）
  /**
   * true のとき、わざ1とわざ2は同じ番号どうしの組み合わせで固定
   * （例: ウーラオス = あんこくきょうだ↔じごくづき / すいりゅうれんだ↔アクアブレイク）
   */
  linkedMoves?: boolean;
  /** true のとき、技は試合中に変更できるので抽選しない（例: バシャーモ、ミュウ） */
  freeMoves?: boolean;
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
