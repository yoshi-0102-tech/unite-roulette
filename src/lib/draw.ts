import type { DrawResult, Pokemon, SlotConstraint } from "../data/types";

/** 配列からランダムに1つ選ぶ小さな道具。 */
function pickRandom<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/** 技候補からランダムに1つ選ぶ。まだ未登録なら「（未設定）」を返す。 */
function pickMove(moves: string[]): string {
  return moves.length > 0 ? pickRandom(moves) : "（未設定）";
}

/** 試合中に技変更できるポケモンの表示ラベル。 */
export const FREE_MOVE_LABEL = "自由（試合中変更可）";

/** ポケモンの特性（連動・自由）を考慮して技2つを決める。 */
function pickMoves(p: Pokemon): { move1: string; move2: string } {
  // 試合中変更可 → 抽選しない
  if (p.freeMoves) {
    return { move1: FREE_MOVE_LABEL, move2: FREE_MOVE_LABEL };
  }
  // 組み合わせ固定 → 同じ番号のペアを一緒に選ぶ
  if (p.linkedMoves && p.move1.length > 0 && p.move1.length === p.move2.length) {
    const index = Math.floor(Math.random() * p.move1.length);
    return { move1: p.move1[index], move2: p.move2[index] };
  }
  // 通常 → それぞれ独立に抽選
  return { move1: pickMove(p.move1), move2: pickMove(p.move2) };
}

/** 抽選が失敗したときに理由を返すための型。 */
export type DrawOutcome =
  | { ok: true; results: DrawResult[] }
  | { ok: false; error: string };

/**
 * チーム抽選のメイン処理。
 *
 * @param pool      抽選対象になる全ポケモン
 * @param slots     各プレイヤー枠のしばり（"any" またはロール）。配列の長さ = 人数
 * @returns         成功なら results、失敗なら error 付き
 *
 * ルール:
 *  - 同じチーム内でポケモンは重複しない
 *  - 各ポケモンの move1 / move2 からそれぞれ1つずつランダムに技を選ぶ
 */
export function drawTeam(pool: Pokemon[], slots: SlotConstraint[]): DrawOutcome {
  const results: DrawResult[] = [];
  const usedIds = new Set<string>(); // すでに選ばれたポケモンのID

  for (let i = 0; i < slots.length; i++) {
    const constraint = slots[i];

    // まだ選ばれていない かつ しばりに合うポケモンだけに絞る
    const candidates = pool.filter((p) => {
      if (usedIds.has(p.id)) return false; // 重複除外
      if (constraint === "any") return true; // おまかせ
      return p.role === constraint; // ロール指定
    });

    if (candidates.length === 0) {
      const label = constraint === "any" ? "おまかせ" : constraint;
      return {
        ok: false,
        error: `${i + 1}人目（${label}）に割り当てられるポケモンが足りません。データを増やすか、ロール指定をゆるめてください。`,
      };
    }

    const pokemon = pickRandom(candidates);
    usedIds.add(pokemon.id);

    const moves = pickMoves(pokemon);
    results.push({
      pokemon,
      chosenMove1: moves.move1,
      chosenMove2: moves.move2,
    });
  }

  return { ok: true, results };
}
