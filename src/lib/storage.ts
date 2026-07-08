import { DATA_VERSION, SEED_POKEMON } from "../data/pokemon";
import { ROLES, type Pokemon, type Role } from "../data/types";

// ブラウザ保存（localStorage）で使うキー名。他アプリと被らないよう接頭辞をつける。
const STORAGE_KEY = "unite-roulette:pokemon";

/**
 * 受け取った値が「ちゃんとしたポケモン配列」か確認して返す。
 * 壊れたデータ（手で編集した JSON など）を読み込んでも落ちないようにするため。
 */
function sanitize(value: unknown): Pokemon[] | null {
  if (!Array.isArray(value)) return null;

  const result: Pokemon[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const p = item as Record<string, unknown>;

    if (typeof p.id !== "string" || typeof p.name !== "string") return null;
    if (!ROLES.includes(p.role as Role)) return null;
    if (!Array.isArray(p.move1) || !Array.isArray(p.move2)) return null;

    const pokemon: Pokemon = {
      id: p.id,
      name: p.name,
      role: p.role as Role,
      move1: p.move1.map(String),
      move2: p.move2.map(String),
    };
    if (p.linkedMoves === true) pokemon.linkedMoves = true;
    if (p.freeMoves === true) pokemon.freeMoves = true;
    result.push(pokemon);
  }
  return result;
}

/**
 * 保存済みデータを読み込む。
 * - 無い／壊れている → 初期データ（seed）
 * - seed のバージョンが上がっていた → 古い保存データは捨てて新しい seed
 */
export function loadPokemon(): Pokemon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_POKEMON;
    const parsed: unknown = JSON.parse(raw);

    // 旧形式（ただの配列）はバージョン管理前のデータなので seed に置き換える
    if (Array.isArray(parsed)) return SEED_POKEMON;

    const obj = parsed as { version?: unknown; pokemon?: unknown };
    if (obj.version !== DATA_VERSION) return SEED_POKEMON;

    return sanitize(obj.pokemon) ?? SEED_POKEMON;
  } catch {
    return SEED_POKEMON;
  }
}

/** 現在のデータをバージョン番号付きでブラウザに保存する。 */
export function savePokemon(list: Pokemon[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: DATA_VERSION, pokemon: list }),
  );
}

/** データを JSON ファイルとしてダウンロードさせる（バックアップ・共有用）。 */
export function exportPokemon(list: Pokemon[]): void {
  const json = JSON.stringify(list, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "unite-roulette-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 読み込んだファイルのテキストを解析してポケモン配列にする。
 * 中身が不正なら例外を投げる（呼び出し側でメッセージ表示）。
 */
export function parseImported(text: string): Pokemon[] {
  const parsed = sanitize(JSON.parse(text));
  if (!parsed) {
    throw new Error("ファイルの形式が正しくありません。");
  }
  return parsed;
}
