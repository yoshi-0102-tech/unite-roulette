import { useEffect, useState } from "react";
import "./App.css";
import { Editor } from "./components/Editor";
import { Roulette } from "./components/Roulette";
import type { Pokemon } from "./data/types";
import { loadPokemon, savePokemon } from "./lib/storage";

type Tab = "roulette" | "editor";

function App() {
  // アプリ全体で共有するポケモン一覧。最初に保存済みデータを読み込む。
  const [pokemon, setPokemon] = useState<Pokemon[]>(() => loadPokemon());
  const [tab, setTab] = useState<Tab>("roulette");

  // pokemon が変わるたびに自動でブラウザ保存する。
  useEffect(() => {
    savePokemon(pokemon);
  }, [pokemon]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>🎰 ユナイト チームルーレット</h1>
        <p className="app__subtitle">
          ポケモンと技をランダムに抽選（チーム内でポケモンは重複しません）
        </p>
      </header>

      <nav className="tabs">
        <button
          className={"tabs__btn" + (tab === "roulette" ? " tabs__btn--active" : "")}
          onClick={() => setTab("roulette")}
        >
          🎲 抽選
        </button>
        <button
          className={"tabs__btn" + (tab === "editor" ? " tabs__btn--active" : "")}
          onClick={() => setTab("editor")}
        >
          ✏️ 編集
        </button>
      </nav>

      {tab === "roulette" ? (
        <Roulette pokemon={pokemon} />
      ) : (
        <Editor pokemon={pokemon} onChange={setPokemon} />
      )}
    </div>
  );
}

export default App;
