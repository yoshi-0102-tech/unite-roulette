import { useEffect, useRef, useState } from "react";
import { ROLES, type DrawResult, type Pokemon, type SlotConstraint } from "../data/types";
import { drawTeam } from "../lib/draw";

// しばりの選択肢。先頭は「おまかせ」。
const CONSTRAINT_OPTIONS: { value: SlotConstraint; label: string }[] = [
  { value: "any", label: "おまかせ" },
  ...ROLES.map((r) => ({ value: r, label: r })),
];

// 演出のタイミング（ミリ秒）。
const ROLL_INTERVAL = 70; // 名前が切り替わる速さ
const FIRST_LOCK = 700; // 1人目が確定するまで
const LOCK_STEP = 260; // 次の1人が確定するまでの間隔

/** 抽選画面。抽選対象のポケモン一覧を props で受け取る。 */
export function Roulette({ pokemon }: { pokemon: Pokemon[] }) {
  const [slots, setSlots] = useState<SlotConstraint[]>(() =>
    Array(5).fill("any"),
  );
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 何人目まで「確定済み」か。演出中は少しずつ増えていく。
  const [lockedCount, setLockedCount] = useState(0);
  // 名前をパラパラ切り替えるための再描画トリガー（値は使わない）。
  const [, setRollTick] = useState(0);

  // タイマーを保持しておき、あとで確実に止められるようにする。
  const intervalRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  function clearTimers() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  // 画面から消えるときにタイマーを掃除する（後始末）。
  useEffect(() => clearTimers, []);

  function changeCount(count: number) {
    setSlots((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("any");
      next.length = count;
      return next;
    });
  }

  function changeSlot(index: number, value: SlotConstraint) {
    setSlots((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleDraw() {
    const outcome = drawTeam(pokemon, slots);
    if (!outcome.ok) {
      setResults(null);
      setError(outcome.error);
      return;
    }
    setError(null);
    clearTimers();
    setResults(outcome.results);
    setLockedCount(0);

    // 名前をパラパラ切り替える（確定していないカードだけ動く）。
    intervalRef.current = window.setInterval(() => {
      setRollTick((t) => t + 1);
    }, ROLL_INTERVAL);

    // 1人ずつ順番に確定させる。
    outcome.results.forEach((_, i) => {
      const id = window.setTimeout(() => {
        setLockedCount(i + 1);
        // 最後の1人が確定したらパラパラを止める。
        if (i === outcome.results.length - 1 && intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, FIRST_LOCK + i * LOCK_STEP);
      timeoutsRef.current.push(id);
    });
  }

  // 演出中（まだ全員は確定していない）かどうか。
  const rolling = results !== null && lockedCount < results.length;

  // パラパラ表示用に、ランダムなポケモン名を1つ返す。
  function randomName(): string {
    if (pokemon.length === 0) return "？";
    return pokemon[Math.floor(Math.random() * pokemon.length)].name;
  }

  return (
    <>
      <section className="panel">
        <div className="field">
          <span className="field__label">人数</span>
          <div className="count-buttons">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={
                  "count-buttons__btn" +
                  (slots.length === n ? " count-buttons__btn--active" : "")
                }
                onClick={() => changeCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">各プレイヤーのロール指定</span>
          <div className="slots">
            {slots.map((slot, i) => (
              <label key={i} className="slots__item">
                <span className="slots__num">{i + 1}人目</span>
                <select
                  value={slot}
                  onChange={(e) =>
                    changeSlot(i, e.target.value as SlotConstraint)
                  }
                >
                  {CONSTRAINT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <button className="draw-btn" onClick={handleDraw} disabled={rolling}>
          {rolling ? "抽選中…" : "🎲 抽選する"}
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      {results && (
        <section className="results">
          {results.map((r, i) => {
            const locked = i < lockedCount; // このカードは確定済み？
            return (
              <article
                key={i}
                className={
                  "result-card" +
                  (locked ? " result-card--locked" : " result-card--rolling")
                }
              >
                <div className="result-card__head">
                  <span className="result-card__num">{i + 1}人目</span>
                  {locked ? (
                    <span className={`badge badge--${r.pokemon.role}`}>
                      {r.pokemon.role}
                    </span>
                  ) : (
                    <span className="badge badge--rolling">抽選中</span>
                  )}
                </div>
                <h2 className="result-card__name">
                  {locked ? r.pokemon.name : randomName()}
                </h2>
                <dl className="result-card__moves">
                  <div>
                    <dt>わざ1</dt>
                    <dd>{locked ? r.chosenMove1 : "—"}</dd>
                  </div>
                  <div>
                    <dt>わざ2</dt>
                    <dd>{locked ? r.chosenMove2 : "—"}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
