import { useRef, useState } from "react";
import { SEED_POKEMON } from "../data/pokemon";
import { ROLES, type Pokemon, type Role } from "../data/types";
import { exportPokemon, parseImported } from "../lib/storage";

// 新規追加フォームの入力内容を表す型。
type FormState = {
  name: string;
  role: Role;
  move1a: string;
  move1b: string;
  move2a: string;
  move2b: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  role: "アタック",
  move1a: "",
  move1b: "",
  move2a: "",
  move2b: "",
};

type Props = {
  pokemon: Pokemon[];
  onChange: (next: Pokemon[]) => void; // 変更を親（App）に伝える
};

/** 編集画面。コードを触らずにポケモン・技を追加／修正／削除できる。 */
export function Editor({ pokemon, onChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新規ポケモンを追加する。
  function handleAdd() {
    if (form.name.trim() === "") {
      setMessage("ポケモン名を入力してください。");
      return;
    }
    const newPokemon: Pokemon = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role,
      move1: [form.move1a.trim(), form.move1b.trim()].filter((s) => s !== ""),
      move2: [form.move2a.trim(), form.move2b.trim()].filter((s) => s !== ""),
    };
    onChange([...pokemon, newPokemon]);
    setForm(EMPTY_FORM);
    setMessage(`「${newPokemon.name}」を追加しました。`);
  }

  // 既存ポケモンの一部だけ書き換える。
  function updateItem(id: string, patch: Partial<Pokemon>) {
    onChange(pokemon.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  // 技（2択のうち片方）を書き換える。
  function updateMove(
    id: string,
    slot: "move1" | "move2",
    index: 0 | 1,
    value: string,
  ) {
    const target = pokemon.find((p) => p.id === id);
    if (!target) return;
    const moves = [...target[slot]];
    moves[index] = value;
    updateItem(id, { [slot]: moves } as Partial<Pokemon>);
  }

  // 削除する。
  function handleDelete(id: string, name: string) {
    onChange(pokemon.filter((p) => p.id !== id));
    setMessage(`「${name}」を削除しました。`);
  }

  // JSON ファイルを読み込む。
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImported(String(reader.result));
        onChange(imported);
        setMessage(`${imported.length}体を読み込みました。`);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 同じファイルを連続で選べるようにリセット
  }

  // 初期データに戻す。
  function handleReset() {
    if (confirm("編集内容をすべて破棄して初期データに戻しますか？")) {
      onChange(SEED_POKEMON);
      setMessage("初期データに戻しました。");
    }
  }

  return (
    <section className="editor">
      {/* ツールバー：入出力・初期化 */}
      <div className="editor__toolbar">
        <button onClick={() => exportPokemon(pokemon)}>💾 書き出し(JSON)</button>
        <button onClick={() => fileInputRef.current?.click()}>
          📂 読み込み
        </button>
        <button className="editor__danger" onClick={handleReset}>
          ↺ 初期データに戻す
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          style={{ display: "none" }}
        />
      </div>

      {message && <p className="editor__message">{message}</p>}

      {/* 新規追加フォーム */}
      <div className="editor__add panel">
        <span className="field__label">＋ 新しいポケモンを追加</span>
        <div className="editor__form">
          <input
            placeholder="ポケモン名"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="editor__moverow">
            <input
              placeholder="わざ1・候補A"
              value={form.move1a}
              onChange={(e) => setForm({ ...form, move1a: e.target.value })}
            />
            <input
              placeholder="わざ1・候補B"
              value={form.move1b}
              onChange={(e) => setForm({ ...form, move1b: e.target.value })}
            />
          </div>
          <div className="editor__moverow">
            <input
              placeholder="わざ2・候補A"
              value={form.move2a}
              onChange={(e) => setForm({ ...form, move2a: e.target.value })}
            />
            <input
              placeholder="わざ2・候補B"
              value={form.move2b}
              onChange={(e) => setForm({ ...form, move2b: e.target.value })}
            />
          </div>
          <button className="editor__add-btn" onClick={handleAdd}>
            追加する
          </button>
        </div>
      </div>

      {/* 既存一覧（インライン編集） */}
      <p className="editor__count">登録数: {pokemon.length}体</p>
      <div className="editor__list">
        {pokemon.map((p) => (
          <div key={p.id} className="editor__item">
            <div className="editor__item-head">
              <input
                className="editor__name"
                value={p.name}
                onChange={(e) => updateItem(p.id, { name: e.target.value })}
              />
              <select
                value={p.role}
                onChange={(e) =>
                  updateItem(p.id, { role: e.target.value as Role })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                className="editor__delete"
                onClick={() => handleDelete(p.id, p.name)}
                aria-label="削除"
              >
                🗑
              </button>
            </div>
            <div className="editor__moverow">
              <input
                placeholder="わざ1・候補A"
                value={p.move1[0] ?? ""}
                onChange={(e) => updateMove(p.id, "move1", 0, e.target.value)}
              />
              <input
                placeholder="わざ1・候補B"
                value={p.move1[1] ?? ""}
                onChange={(e) => updateMove(p.id, "move1", 1, e.target.value)}
              />
            </div>
            <div className="editor__moverow">
              <input
                placeholder="わざ2・候補A"
                value={p.move2[0] ?? ""}
                onChange={(e) => updateMove(p.id, "move2", 0, e.target.value)}
              />
              <input
                placeholder="わざ2・候補B"
                value={p.move2[1] ?? ""}
                onChange={(e) => updateMove(p.id, "move2", 1, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
