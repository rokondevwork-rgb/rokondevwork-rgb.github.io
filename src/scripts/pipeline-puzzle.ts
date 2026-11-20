/**
 * Pipeline puzzle for the Break room (/games/). Plain DOM: every pipe is a real <button>.
 *
 * A raw supplier feed comes in on the left, a clean record waits on the right. Every pipe can be
 * turned a quarter turn; join the two and the data flows. Each puzzle is generated: a random
 * path is laid first (so it can always be solved), the rest of the grid is filled with random
 * pipes, and then everything is turned at random. Par is the fewest turns that fix the path.
 */

export interface PipeHud {
  level: number;
  moves: number;
  par: number;
  stars: number;
  solved: boolean;
}

export interface PipelinePuzzle {
  hint(): void;
  reset(): void;
  next(): void;
  destroy(): void;
}

type Kind = "I" | "L" | "T" | "X" | "O";

interface Cell {
  kind: Kind;
  start: number; // turns when the puzzle was dealt
  turns: number; // turns now (only ever goes up, so the CSS rotation never spins backwards)
  sol?: number; // turns that put this pipe on the path (path cells only)
  el?: HTMLButtonElement | HTMLSpanElement;
}

const N = 1;
const E = 2;
const S = 4;
const W = 8;
const BASE: Record<Kind, number> = { I: N | S, L: N | E, T: N | E | S, X: 15, O: 0 };
const DRAW: Record<Kind, string> = { I: "M32 0V64", L: "M32 0V32H64", T: "M32 0V64M32 32H64", X: "M32 0V64M0 32H64", O: "" };
const NAMES: Record<Kind, string> = { I: "Straight pipe", L: "Bend", T: "Tee", X: "Cross", O: "Concrete" };
const STEPS: [number, number, number, number][] = [
  [N, 0, -1, S],
  [E, 1, 0, W],
  [S, 0, 1, N],
  [W, -1, 0, E],
];
const SAVE_KEY = "pipeline-puzzle:progress";

const rot = (m: number, r: number) => {
  for (let i = 0; i < ((r % 4) + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
};
const mask = (c: Cell) => rot(BASE[c.kind], c.turns);
const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T>(a: T[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface Progress {
  level: number;
  stars: number;
}
const loadProgress = (): Progress => {
  try {
    const p = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "");
    if (Number.isInteger(p.level) && Number.isInteger(p.stars)) return p;
  } catch {}
  return { level: 1, stars: 0 };
};
const saveProgress = (p: Progress) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
  } catch {}
};

export function createPipelinePuzzle(root: HTMLElement, onHud: (hud: PipeHud) => void): PipelinePuzzle {
  const board = root.querySelector<HTMLElement>("[data-pipe-board]")!;
  const feed = root.querySelector<HTMLElement>("[data-pipe-feed]")!;
  const record = root.querySelector<HTMLElement>("[data-pipe-record]")!;
  const scope = root.closest("dialog") ?? root;
  const done = scope.querySelector<HTMLElement>("[data-pipe-done]")!;
  const doneText = scope.querySelector<HTMLElement>("[data-pipe-done-text]")!;
  const nextBtn = scope.querySelector<HTMLButtonElement>("[data-pipe-next]")!;

  let progress = loadProgress();
  let level = progress.level;
  let cols = 5;
  let rows = 4;
  let src = 0;
  let sink = 0;
  let cells: Cell[] = [];
  let moves = 0;
  let par = 0;
  let solved = false;
  let focusIndex = 0;

  const at = (x: number, y: number) => y * cols + x;
  const hud = () => onHud({ level, moves, par, stars: progress.stars, solved });

  // ---------------------------------------------------------------- generating a puzzle
  const sizeFor = (lvl: number, narrow: boolean): [number, number] => {
    const wide: [number, number][] = [[5, 4], [6, 4], [6, 5], [7, 5], [8, 5], [8, 6]];
    const tall: [number, number][] = [[4, 5], [4, 6], [5, 6], [5, 7], [5, 8], [6, 8]];
    const list = narrow ? tall : wide;
    return list[Math.min(lvl - 1, list.length - 1)];
  };

  /** A random path of cells from the feed's cell to the record's cell, without crossing itself. */
  const layPath = (): number[] | null => {
    const target = at(cols - 1, sink);
    const minLen = cols + Math.min(level, 4) + 1;
    const seen = new Set<number>();
    const path: number[] = [];
    let budget = 6000;
    const walk = (i: number): boolean => {
      if (--budget < 0) return false;
      path.push(i);
      seen.add(i);
      if (i === target) {
        if (path.length >= minLen) return true;
      } else {
        const x = i % cols;
        const y = Math.floor(i / cols);
        for (const [, dx, dy] of shuffle(STEPS.slice())) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const j = at(nx, ny);
          if (!seen.has(j) && walk(j)) return true;
        }
      }
      path.pop();
      seen.delete(i);
      return false;
    };
    return walk(at(0, src)) ? path : null;
  };

  const deal = () => {
    const narrow = root.clientWidth < 560;
    [cols, rows] = sizeFor(level, narrow);
    let path: number[] | null = null;
    for (let tries = 0; tries < 40 && !path; tries++) {
      src = rand(rows);
      sink = rand(rows);
      path = layPath();
    }
    if (!path) {
      // Never expected, but a straight run along one row always works.
      src = sink = rand(rows);
      path = Array.from({ length: cols }, (_, x) => at(x, src));
    }

    // Fill: random pipes, a little concrete.
    cells = Array.from({ length: cols * rows }, () => {
      const r = Math.random();
      const kind: Kind = r < 0.06 ? "O" : r < 0.38 ? "I" : r < 0.78 ? "L" : r < 0.95 ? "T" : "X";
      return { kind, start: 0, turns: 0 };
    });

    // The path: each cell opens towards the cell before it and the cell after it.
    const dirTo = (a: number, b: number) => {
      const dx = (b % cols) - (a % cols);
      const dy = Math.floor(b / cols) - Math.floor(a / cols);
      return dx === 1 ? E : dx === -1 ? W : dy === 1 ? S : N;
    };
    const opposite = (d: number) => rot(d, 2);
    path.forEach((i, k) => {
      const inDir = k === 0 ? W : opposite(dirTo(path![k - 1], i));
      const outDir = k === path!.length - 1 ? E : dirTo(i, path![k + 1]);
      const m = inDir | outDir;
      const kind: Kind = m === (N | S) || m === (E | W) ? "I" : "L";
      let sol = 0;
      while (rot(BASE[kind], sol) !== m) sol++;
      cells[i] = { kind, start: 0, turns: 0, sol };
    });

    // Turn everything at random, and make sure the puzzle doesn't start solved.
    do {
      for (const c of cells) c.start = c.turns = rand(4);
    } while (flow().solved);

    const pathCost = cells.reduce((n, c) => {
      if (c.sol === undefined) return n;
      let k = 0;
      while (k < 4 && rot(BASE[c.kind], c.start + k) !== rot(BASE[c.kind], c.sol)) k++;
      return n + k;
    }, 0);
    par = fewestTurns(pathCost);
    moves = 0;
    solved = false;
    focusIndex = at(0, src);
    build();
    paint();
    hud();
  };

  /**
   * Par: the fewest quarter turns that join the feed to the record, by any route that doesn't
   * cross itself. A depth-first search that gives up on any route already dearer than the best
   * one found; it starts from the laid path's cost, so par is always reachable.
   */
  const fewestTurns = (pathCost: number) => {
    const turnsTo = (c: Cell, r: number) => {
      const want = rot(BASE[c.kind], r);
      for (let k = 0; k < 4; k++) if (rot(BASE[c.kind], c.turns + k) === want) return k;
      return 4;
    };
    const end = at(cols - 1, sink);
    const dist = (x: number, y: number) => Math.abs(cols - 1 - x) + Math.abs(sink - y);
    let best = pathCost;
    let budget = 150000;
    const seen = new Set<number>();
    const visit = (i: number, side: number, cost: number) => {
      if (--budget < 0 || cost >= best) return;
      const c = cells[i];
      const x = i % cols;
      const y = Math.floor(i / cols);
      // Cheapest turns first, so good routes are found early and prune the rest.
      const options = [0, 1, 2, 3]
        .filter((r) => rot(BASE[c.kind], r) & side)
        .map((r) => ({ r, k: turnsTo(c, r) }))
        .sort((a, b) => a.k - b.k);
      const tried = new Set<number>();
      seen.add(i);
      for (const { r, k } of options) {
        const m = rot(BASE[c.kind], r);
        if (tried.has(m)) continue;
        tried.add(m);
        if (i === end && m & E) {
          best = Math.min(best, cost + k);
          continue;
        }
        const exits = STEPS.filter(([bit, dx, dy]) => bit !== side && m & bit && x + dx >= 0 && y + dy >= 0 && x + dx < cols && y + dy < rows)
          .sort((a, b) => dist(x + a[1], y + a[2]) - dist(x + b[1], y + b[2]));
        for (const [, dx, dy, back] of exits) {
          const j = at(x + dx, y + dy);
          if (!seen.has(j) && cells[j].kind !== "O") visit(j, back, cost + k);
        }
      }
      seen.delete(i);
    };
    visit(at(0, src), W, 0);
    return best;
  };

  // ---------------------------------------------------------------- flow
  const flow = () => {
    const lit = new Set<number>();
    const first = at(0, src);
    if (mask(cells[first]) & W) {
      const queue = [first];
      lit.add(first);
      while (queue.length) {
        const i = queue.shift()!;
        const x = i % cols;
        const y = Math.floor(i / cols);
        for (const [bit, dx, dy, back] of STEPS) {
          const nx = x + dx;
          const ny = y + dy;
          if (!(mask(cells[i]) & bit) || nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const j = at(nx, ny);
          if (!lit.has(j) && mask(cells[j]) & back) {
            lit.add(j);
            queue.push(j);
          }
        }
      }
    }
    const end = at(cols - 1, sink);
    return { lit, solved: lit.has(end) && (mask(cells[end]) & E) !== 0 };
  };

  // ---------------------------------------------------------------- DOM
  const svgFor = (kind: Kind) =>
    `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path class="pipe-body" d="${DRAW[kind]}"/><path class="pipe-flow" d="${DRAW[kind]}"/></svg>`;

  const build = () => {
    board.style.setProperty("--cols", String(cols));
    board.style.setProperty("--rows", String(rows));
    board.replaceChildren();
    cells.forEach((c, i) => {
      if (c.kind === "O") {
        const block = document.createElement("span");
        block.className = "pipe-tile pipe-tile--solid";
        block.setAttribute("aria-hidden", "true");
        c.el = block;
      } else {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pipe-tile";
        b.innerHTML = svgFor(c.kind);
        // Dealt at its angle straight away, so a new puzzle doesn't spin into place.
        b.querySelector("svg")!.style.rotate = `${c.turns * 90}deg`;
        b.tabIndex = i === focusIndex ? 0 : -1;
        b.addEventListener("click", () => turn(i));
        b.addEventListener("focus", () => (focusIndex = i));
        c.el = b;
      }
      board.append(c.el);
    });
    feed.style.setProperty("--row", String(src));
    record.style.setProperty("--row", String(sink));
    done.hidden = true;
    fit();
  };

  const paint = () => {
    const { lit } = flow();
    cells.forEach((c, i) => {
      if (!c.el || c.kind === "O") return;
      const svg = c.el.querySelector("svg")!;
      svg.style.rotate = `${c.turns * 90}deg`;
      c.el.classList.toggle("is-lit", lit.has(i));
      const x = i % cols;
      const y = Math.floor(i / cols);
      c.el.setAttribute("aria-label", `${NAMES[c.kind]}, row ${y + 1}, column ${x + 1}${lit.has(i) ? ", data flowing" : ""}. Turn it.`);
    });
    record.classList.toggle("is-clean", solved);
  };

  const turn = (i: number) => {
    if (solved) return;
    const c = cells[i];
    c.turns += 1;
    moves += 1;
    const result = flow();
    solved = result.solved;
    paint();
    if (solved) win();
    hud();
  };

  const win = () => {
    const stars = moves <= par ? 3 : moves <= par + Math.max(3, Math.round(par * 0.5)) ? 2 : 1;
    progress = { level: level + 1, stars: progress.stars + stars };
    saveProgress(progress);
    doneText.textContent = `${moves} ${moves === 1 ? "move" : "moves"} · par ${par} · ${"★".repeat(stars)}${"☆".repeat(3 - stars)}`;
    done.hidden = false;
    board.querySelectorAll("button").forEach((b) => (b.tabIndex = -1));
    nextBtn.focus({ preventScroll: true });
  };

  /** Tile size: as big as fits beside the feed and record labels, up to 84 px. */
  const fit = () => {
    const stage = board.parentElement!;
    const side = root.clientWidth < 640 ? 40 : 240;
    const room = Math.min((root.clientWidth - side) / cols, (root.clientHeight - 48) / rows);
    stage.style.setProperty("--tile", `${Math.max(34, Math.min(84, Math.floor(room - 2)))}px`);
  };

  // Arrow keys move between pipes (one tab stop for the whole board).
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const step = keys[e.key];
    if (!step || !(e.target as Element).closest(".pipe-tile")) return;
    e.preventDefault();
    let x = focusIndex % cols;
    let y = Math.floor(focusIndex / cols);
    for (let k = 0; k < Math.max(cols, rows); k++) {
      x = Math.min(cols - 1, Math.max(0, x + step[0]));
      y = Math.min(rows - 1, Math.max(0, y + step[1]));
      const c = cells[at(x, y)];
      if (c.kind !== "O") break;
    }
    const next = cells[at(x, y)].el;
    if (next instanceof HTMLButtonElement) {
      cells.forEach((c) => c.el instanceof HTMLButtonElement && (c.el.tabIndex = -1));
      next.tabIndex = 0;
      next.focus();
    }
  };
  board.addEventListener("keydown", onKey);
  const onNext = () => api.next();
  nextBtn.addEventListener("click", onNext);
  const ro = new ResizeObserver(fit);
  ro.observe(root);

  const api: PipelinePuzzle = {
    hint() {
      if (solved) return;
      // Flash the first pipe on the path that is still turned the wrong way.
      const wrong = cells.findIndex((c) => c.sol !== undefined && mask(c) !== rot(BASE[c.kind], c.sol));
      const el = cells[wrong]?.el;
      if (!el) return;
      moves += 1; // a hint costs a move
      el.classList.remove("is-hint");
      void el.offsetWidth;
      el.classList.add("is-hint");
      setTimeout(() => el.classList.remove("is-hint"), 1600);
      hud();
    },
    reset() {
      // Turn each pipe forward to its starting angle, so nothing spins backwards.
      for (const c of cells) {
        const extra = (((c.start - c.turns) % 4) + 4) % 4;
        c.turns += extra;
      }
      moves = 0;
      solved = false;
      done.hidden = true;
      cells.forEach((c, i) => c.el instanceof HTMLButtonElement && (c.el.tabIndex = i === focusIndex ? 0 : -1));
      paint();
      hud();
    },
    next() {
      level = progress.level;
      deal();
      (cells[focusIndex]?.el as HTMLElement | undefined)?.focus({ preventScroll: true });
    },
    destroy() {
      ro.disconnect();
      board.removeEventListener("keydown", onKey);
      nextBtn.removeEventListener("click", onNext);
      board.replaceChildren();
    },
  };

  deal();
  return api;
}
