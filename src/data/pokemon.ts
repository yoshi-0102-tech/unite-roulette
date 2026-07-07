import type { Pokemon } from "./types";
import rawData from "./pokemon.json";

/**
 * 初期データ（種）。実データは pokemon.json に分離してある。
 *
 * ⚠️ 技名やロールはアプデで変わることがある。ここは「初期値」であり、
 *    最新データはアプリの編集画面から追加・修正、または pokemon.json を
 *    更新して差し替える想定。将来 Web から取得する形にも移行しやすい。
 *
 * データ出典: ポケモンユナイト攻略Wiki（wikiwiki.jp/poke-unite）
 */
export const SEED_POKEMON: Pokemon[] = rawData as Pokemon[];
