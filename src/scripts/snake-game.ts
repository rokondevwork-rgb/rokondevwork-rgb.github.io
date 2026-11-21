/**
 * Snake for the Gaming room (/games/). Plain canvas, no libraries.
 *
 * The site's own Python snake (blue body, yellow eyes) crawls a grid and eats bugs. Every five bugs
 * it speeds up and a golden bug appears for a few seconds. Walls and its own tail end the game.
 * The board is a fixed grid for the life of a game (wider on a wide screen, taller on a phone) and
 * is scaled to fit its box. Moves happen on a fixed tick; drawing slides between ticks, so the
 * snake glides instead of jumping.
 * Controls: arrows or WASD, swipe, or the on-screen pad; Space starts and resumes; P pauses.
 */

export type SnakePhase = "ready" | "playing" | "paused" | "over";
export type Dir = "up" | "down" | "left" | "right";

export interface SnakeHud {
  score: number;
  length: number;
  speed: number;
  best: number;
  phase: SnakePhase;
}

export interface SnakeGame {
  turn(dir: Dir): void;
  pause(): void;
  resume(): void;
  togglePause(): void;
  restart(): void;
  destroy(): void;
}

type Cell = { x: number; y: number };

const BEST_KEY = "snake:best";
const CELL = 24;
const START_STEP = 150; // ms per move at speed 1
const MIN_STEP = 70;
const STEP_FASTER = 10; // ms quicker each speed level
const BUGS_PER_LEVEL = 5;
const GOLD_MS = 5000;
const GOLD_POINTS = 50;

const FIELD = "#22211e";
const CHALK = "#ece6da";
const CHALK_DIM = "#a39d91";
const SIGNAL = "#ff6a3d";
const PY_BLUE = "#4b8bbe";
const PY_DARK = "#306998";
const PY_YELLOW = "#ffd43b";

const VEC: Record<Dir, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (n: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {}
};

export function createSnakeGame(canvas: HTMLCanvasElement, onHud: (hud: SnakeHud) => void): SnakeGame {
  const ctx = canvas.getContext("2d")!;
  const box = canvas.parentElement!;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";

  // The grid, fixed for the life of the game.
  const narrow = box.clientWidth < 560;
  const COLS = narrow ? 15 : 28;
  const ROWS = Math.round(Math.min(Math.max((COLS * box.clientHeight) / Math.max(box.clientWidth, 1), narrow ? 14 : 12), narrow ? 26 : 20));
  const W = COLS * CELL;
  const H = ROWS * CELL;

  let snake: Cell[] = [];
  let prev: Cell[] = [];
  let dir: Dir = "right";
  let queue: Dir[] = [];
  let bug: Cell = { x: 0, y: 0 };
  let gold: (Cell & { until: number }) | null = null;
  let grow = 0;
  let score = 0;
  let eaten = 0;
  let speed = 1;
  let best = readBest();
  let phase: SnakePhase = "ready";
  let pausedFrom: SnakePhase = "ready";
  let crash: Cell | null = null;
  let pops: { x: number; y: number; t: number; c: string; text: string }[] = [];

  let scale = 1;
  let offX = 0;
  let offY = 0;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let pausedAt = 0;

  const stepMs = () => Math.max(MIN_STEP, START_STEP - (speed - 1) * STEP_FASTER);
  const hud = () => onHud({ score, length: snake.length, speed, best, phase });

  // ---------------------------------------------------------------- board
  const free = (): Cell[] => {
    const taken = new Set(snake.map((c) => c.y * COLS + c.x));
    if (gold) taken.add(gold.y * COLS + gold.x);
    taken.add(bug.y * COLS + bug.x);
    const cells: Cell[] = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!taken.has(y * COLS + x)) cells.push({ x, y });
    return cells;
  };
  const randomFree = () => {
    const cells = free();
    return cells.length ? cells[Math.floor(Math.random() * cells.length)] : null;
  };

  const newGame = () => {
    const y = Math.floor(ROWS / 2);
    const x = Math.min(5, Math.floor(COLS / 3));
    snake = Array.from({ length: 4 }, (_, i) => ({ x: x - i, y }));
    prev = snake.map((c) => ({ ...c }));
    dir = "right";
    queue = [];
    grow = 0;
    score = 0;
    eaten = 0;
    speed = 1;
    gold = null;
    crash = null;
    pops = [];
    bug = { x: -1, y: -1 };
    bug = randomFree() ?? { x: COLS - 3, y };
    phase = "ready";
    acc = 0;
    hud();
  };

  // ---------------------------------------------------------------- moves
  const turn = (d: Dir) => {
    if (phase === "over") return;
    if (phase === "paused") return;
    const lastDir = queue.length ? queue[queue.length - 1] : dir;
    if (d === lastDir || d === OPPOSITE[lastDir]) {
      if (phase === "ready" && d !== OPPOSITE[dir]) start();
      return;
    }
    if (queue.length < 2) queue.push(d);
    if (phase === "ready") start();
  };

  const start = () => {
    if (phase !== "ready") return;
    phase = "playing";
    acc = 0;
    last = performance.now();
    hud();
  };

  const pop = (c: Cell, color: string, text: string) => {
    if (!reduceMotion) pops.push({ x: c.x * CELL + CELL / 2, y: c.y * CELL + CELL / 2, t: 0, c: color, text });
  };

  const tick = (now: number) => {
    if (queue.length) dir = queue.shift()!;
    const v = VEC[dir];
    const head = { x: snake[0].x + v.x, y: snake[0].y + v.y };
    const willGrow = grow > 0;
    // The tail leaves its cell this tick unless the snake is growing, so the head may move into it.
    const body = willGrow ? snake : snake.slice(0, -1);
    const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
    if (hitWall || body.some((c) => c.x === head.x && c.y === head.y)) {
      crash = hitWall ? snake[0] : head;
      phase = "over";
      prev = snake.map((c) => ({ ...c }));
      if (score > best) {
        best = score;
        saveBest(best);
      }
      hud();
      return;
    }

    prev = snake.map((c) => ({ ...c }));
    snake.unshift(head);
    if (willGrow) {
      grow -= 1;
      prev.push({ ...snake[snake.length - 1] }); // the new tail starts where it already is
    } else snake.pop();

    if (head.x === bug.x && head.y === bug.y) {
      eaten += 1;
      score += 10;
      grow += 1;
      pop(head, SIGNAL, "+10");
      if (eaten % BUGS_PER_LEVEL === 0) {
        speed += 1;
        const spot = randomFree();
        if (spot) gold = { ...spot, until: now + GOLD_MS };
      }
      bug = randomFree() ?? bug;
      if (!free().length && !gold) {
        // Board full: nothing left to eat.
        phase = "over";
      }
    } else if (gold && head.x === gold.x && head.y === gold.y) {
      score += GOLD_POINTS;
      grow += 2;
      pop(head, PY_YELLOW, `+${GOLD_POINTS}`);
      gold = null;
    }
    if (score > best) {
      best = score;
      saveBest(best);
    }
    hud();
  };

  // ---------------------------------------------------------------- drawing
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const bw = box.clientWidth;
    const bh = box.clientHeight;
    canvas.width = Math.round(bw * dpr);
    canvas.height = Math.round(bh * dpr);
    scale = Math.min(bw / W, bh / H);
    offX = (bw - W * scale) / 2;
    offY = (bh - H * scale) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
    draw(performance.now());
  };

  const text = (s: string, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px ${mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.toUpperCase(), W / 2, y);
  };

  const centre = (c: Cell) => ({ x: c.x * CELL + CELL / 2, y: c.y * CELL + CELL / 2 });

  const drawBug = (c: Cell, now: number, body: string, shell: string) => {
    const { x, y } = centre(c);
    const wob = reduceMotion ? 0 : Math.sin(now / 140) * 1.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = shell;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const s of [-1, 1]) {
      for (const ly of [-3.5, 0.5, 4.5]) {
        ctx.moveTo(s * 3, ly);
        ctx.lineTo(s * 8, ly + (ly < 0 ? -2 : 2) + s * wob * 0.5);
      }
      ctx.moveTo(s * 1.5, -6.5);
      ctx.lineTo(s * 4.5, -10 + wob * 0.4);
    }
    ctx.stroke();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 1, 5.2, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -5.6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FIELD;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -2.5);
    ctx.lineTo(0, 7.5);
    ctx.stroke();
    ctx.restore();
  };

  const draw = (now: number) => {
    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, W, H);
    // Faint cell grid.
    ctx.strokeStyle = "rgba(236, 230, 218, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = CELL; x < W; x += CELL) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = CELL; y < H; y += CELL) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(236, 230, 218, 0.22)";
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // Food.
    drawBug(bug, now, SIGNAL, "#c9542f");
    if (gold) {
      const left = Math.max(0, (gold.until - now) / GOLD_MS);
      const g = centre(gold);
      ctx.strokeStyle = "rgba(255, 212, 59, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, CELL * 0.62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
      ctx.stroke();
      drawBug(gold, now, PY_YELLOW, "#c9a227");
    }

    // Snake: each segment slides from where it was to where it is.
    const alpha = phase === "playing" ? Math.min(acc / stepMs(), 1) : 1;
    const pts = snake.map((c, i) => {
      const p = prev[i] ?? c;
      return { x: (p.x + (c.x - p.x) * alpha) * CELL + CELL / 2, y: (p.y + (c.y - p.y) * alpha) * CELL + CELL / 2 };
    });
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const trace = () => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    };
    ctx.strokeStyle = PY_DARK;
    ctx.lineWidth = CELL * 0.74;
    trace();
    ctx.stroke();
    ctx.strokeStyle = PY_BLUE;
    ctx.lineWidth = CELL * 0.56;
    trace();
    ctx.stroke();
    // A thin yellow stripe down the back.
    ctx.strokeStyle = "rgba(255, 212, 59, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    trace();
    ctx.stroke();
    ctx.setLineDash([]);

    // Head, eyes and tongue.
    const h = pts[0];
    const v = VEC[dir];
    ctx.fillStyle = PY_BLUE;
    ctx.beginPath();
    ctx.arc(h.x, h.y, CELL * 0.42, 0, Math.PI * 2);
    ctx.fill();
    const side = { x: -v.y, y: v.x };
    if (phase !== "over" && !reduceMotion && Math.floor(now / 900) % 3 === 0 && (now % 900) < 260) {
      const tx = h.x + v.x * CELL * 0.42;
      const ty = h.y + v.y * CELL * 0.42;
      ctx.strokeStyle = SIGNAL;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + v.x * 6, ty + v.y * 6);
      ctx.lineTo(tx + v.x * 9 + side.x * 2.5, ty + v.y * 9 + side.y * 2.5);
      ctx.moveTo(tx + v.x * 6, ty + v.y * 6);
      ctx.lineTo(tx + v.x * 9 - side.x * 2.5, ty + v.y * 9 - side.y * 2.5);
      ctx.stroke();
    }
    for (const s of [-1, 1]) {
      const ex = h.x + v.x * 3.5 + side.x * s * 4.6;
      const ey = h.y + v.y * 3.5 + side.y * s * 4.6;
      ctx.fillStyle = PY_YELLOW;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
      ctx.fill();
      if (phase === "over") {
        ctx.strokeStyle = FIELD;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(ex - 1.8, ey - 1.8);
        ctx.lineTo(ex + 1.8, ey + 1.8);
        ctx.moveTo(ex + 1.8, ey - 1.8);
        ctx.lineTo(ex - 1.8, ey + 1.8);
        ctx.stroke();
      } else {
        ctx.fillStyle = FIELD;
        ctx.beginPath();
        ctx.arc(ex + v.x * 0.9, ey + v.y * 0.9, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (crash && phase === "over") {
      const c = centre(crash);
      ctx.strokeStyle = SIGNAL;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - CELL / 2 + 1, c.y - CELL / 2 + 1, CELL - 2, CELL - 2);
    }

    // Points float up from where they were scored.
    pops = pops.filter((p) => p.t < 1);
    for (const p of pops) {
      ctx.globalAlpha = 1 - p.t;
      ctx.fillStyle = p.c;
      ctx.font = `500 12px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y - 10 - p.t * 22);
      ctx.globalAlpha = 1;
    }

    // Messages.
    const s = narrow ? 13 : 15;
    if (phase === "over") {
      ctx.fillStyle = "rgba(20, 19, 17, 0.72)";
      ctx.fillRect(0, 0, W, H);
      text(free().length ? "Game over" : "Trench full", H / 2 - 40, s * 2.4, CHALK);
      text(`Score ${score.toLocaleString()} · length ${snake.length} · best ${best.toLocaleString()}`, H / 2 + 6, s * (narrow ? 0.85 : 1), CHALK_DIM);
      text(narrow ? "Tap to play again" : "Press Space to play again", H / 2 + 40, s, SIGNAL);
    } else if (phase === "paused") {
      ctx.fillStyle = "rgba(20, 19, 17, 0.6)";
      ctx.fillRect(0, 0, W, H);
      text("Paused", H / 2 - 14, s * 2, CHALK);
      text(narrow ? "Tap to carry on" : "Press Space or P to carry on", H / 2 + 26, s, CHALK_DIM);
    } else if (phase === "ready") {
      text(narrow ? "Swipe or use the pad to start" : "Press an arrow key to start", H * 0.72, s, CHALK);
      text("Eat the bugs · avoid the walls and your tail", H * 0.72 + s * 1.9, s * 0.85, CHALK_DIM);
    }
  };

  const frame = (now: number) => {
    const dt = Math.min(now - last, 250);
    last = now;
    if (phase === "playing") {
      acc += dt;
      while (acc >= stepMs() && phase === "playing") {
        acc -= stepMs();
        tick(now);
      }
      if (gold && now > gold.until) gold = null;
    }
    for (const p of pops) p.t += dt / 700;
    draw(now);
    raf = requestAnimationFrame(frame);
  };

  // ---------------------------------------------------------------- input
  const primary = () => {
    if (phase === "over") newGame();
    else if (phase === "paused") api.resume();
    else if (phase === "ready") start();
  };

  const KEYS: Record<string, Dir> = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (KEYS[k]) turn(KEYS[k]); else if (k === " " || k === "enter") {
      // Space or Enter on a focused button presses that button instead.
      if ((e.target as Element).closest("button")) return;
      primary();
    } else if (k === "p") api.togglePause();
    else return;
    e.preventDefault();
  };

  // Swipe: a drag of 24px or more turns; a short tap starts, resumes or restarts.
  let start0: { x: number; y: number; id: number } | null = null;
  const onPointerDown = (e: PointerEvent) => {
    start0 = { x: e.clientX, y: e.clientY, id: e.pointerId };
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!start0 || start0.id !== e.pointerId) return;
    const dx = e.clientX - start0.x;
    const dy = e.clientY - start0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    start0 = { x: e.clientX, y: e.clientY, id: e.pointerId }; // keep swiping without lifting
  };
  const onPointerUp = (e: PointerEvent) => {
    if (start0 && start0.id === e.pointerId) {
      const moved = Math.hypot(e.clientX - start0.x, e.clientY - start0.y);
      if (moved < 10 && phase !== "playing") primary();
    }
    start0 = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  const onBlur = () => api.pause();
  const onVisibility = () => document.hidden && api.pause();

  const keyTarget = canvas.closest("dialog") ?? window;
  keyTarget.addEventListener("keydown", onKeyDown as EventListener);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);
  const ro = new ResizeObserver(resize);
  ro.observe(box);

  const api: SnakeGame = {
    turn,
    pause() {
      if (phase === "playing") {
        pausedFrom = phase;
        pausedAt = performance.now();
        phase = "paused";
        hud();
      }
    },
    resume() {
      if (phase === "paused") {
        phase = pausedFrom;
        const now = performance.now();
        if (gold) gold.until += now - pausedAt; // the golden bug's clock stops while paused
        last = now;
        hud();
      }
    },
    togglePause() {
      if (phase === "paused") api.resume();
      else api.pause();
    },
    restart() {
      newGame();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      keyTarget.removeEventListener("keydown", onKeyDown as EventListener);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };

  newGame();
  resize();
  last = performance.now();
  raf = requestAnimationFrame(frame);
  return api;
}
