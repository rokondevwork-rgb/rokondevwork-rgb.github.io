/**
 * Brick breaker for the Break room (/games/). Plain canvas, no libraries.
 *
 * The game runs in its own coordinates: 800 wide on a wide screen, 400 wide on a phone, and as
 * tall as the box it sits in. The canvas is scaled to fit its box, so resizing never moves a brick.
 * Controls: ← → (or A D), mouse, or drag on touch; Space, click or tap launches; P pauses.
 */

export type Phase = "ready" | "playing" | "paused" | "over";

export interface Hud {
  score: number;
  level: number;
  lives: number;
  best: number;
  phase: Phase;
}

export interface BrickBreaker {
  pause(): void;
  resume(): void;
  togglePause(): void;
  restart(): void;
  destroy(): void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  row: number;
}

const LIVES = 3;
const BEST_KEY = "brick-breaker:best";
// Bright floor colours: they read well on the dark field in both themes.
const TONES = ["#5bbfb5", "#d98bb8", "#ff6a3d", "#9daae8", "#d9a45a", "#b7c46a"];
const FIELD = "#22211e";
const CHALK = "#ece6da";
const CHALK_DIM = "#a39d91";
const SIGNAL = "#ff6a3d";

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

export function createBrickBreaker(canvas: HTMLCanvasElement, onHud: (hud: Hud) => void): BrickBreaker {
  const ctx = canvas.getContext("2d")!;
  const box = canvas.parentElement!;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";

  // Game coordinates, fixed for the life of the game.
  const narrow = box.clientWidth < 560;
  const W = narrow ? 400 : 800;
  const H = Math.round(Math.min(Math.max((W * box.clientHeight) / Math.max(box.clientWidth, 1), W * 0.55), W * 1.9));
  const unit = W / 800;
  const cols = narrow ? 6 : 10;

  const paddle = { w: narrow ? 84 : 120, h: 12, x: W / 2, y: H - 34 };
  const ball = { x: W / 2, y: 0, r: narrow ? 6 : 7, vx: 0, vy: 0 };

  let bricks: Brick[] = [];
  let flashes: { x: number; y: number; w: number; h: number; c: string; t: number }[] = [];
  let score = 0;
  let level = 1;
  let lives = LIVES;
  let best = readBest();
  let phase: Phase = "ready";
  let pausedFrom: Phase = "ready";
  let banner = "";
  let bannerUntil = 0;

  let scale = 1;
  let offX = 0;
  let offY = 0;
  let raf = 0;
  let last = 0;
  const keys = { left: false, right: false };

  const hud = () => onHud({ score, level, lives, best, phase });

  // ---------------------------------------------------------------- layout
  const buildWall = () => {
    const pad = 16 * unit + (narrow ? 4 : 0);
    const gap = narrow ? 6 : 8;
    const rows = Math.min(5 + (level - 1), 8);
    const bw = (W - pad * 2 - gap * (cols - 1)) / cols;
    const bh = narrow ? 16 : 20;
    const top = narrow ? 44 : 56;
    bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // From wall 2 on, the top rows take two hits; from wall 3, the wall gets gaps.
        if (level >= 3 && (r + c + level) % 7 === 0) continue;
        bricks.push({ x: pad + c * (bw + gap), y: top + r * (bh + gap), w: bw, h: bh, hp: level >= 2 && r < Math.min(level - 1, 3) ? 2 : 1, row: r });
      }
    }
  };

  const ballSpeed = () => (narrow ? 300 : 420) + (level - 1) * (narrow ? 26 : 38);

  const parkBall = () => {
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x;
    ball.y = paddle.y - ball.r - 1;
  };

  const launch = () => {
    if (phase !== "ready") return;
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI / 2; // up, a little to one side
    const v = ballSpeed();
    ball.vx = v * Math.sin(angle);
    ball.vy = -v * Math.cos(angle);
    phase = "playing";
    hud();
  };

  const newGame = () => {
    score = 0;
    level = 1;
    lives = LIVES;
    paddle.x = W / 2;
    buildWall();
    parkBall();
    phase = "ready";
    say(narrow ? "Wall 1 · tap to launch" : "Wall 1 · click or press Space", 1600);
    hud();
  };

  const say = (text: string, ms: number) => {
    banner = text;
    bannerUntil = performance.now() + ms;
  };

  // ---------------------------------------------------------------- physics
  const hitBrick = (b: Brick) => {
    b.hp -= 1;
    if (b.hp <= 0) {
      bricks.splice(bricks.indexOf(b), 1);
      score += 10 + (8 - Math.min(b.row, 7)) * 2;
      if (!reduceMotion) flashes.push({ x: b.x, y: b.y, w: b.w, h: b.h, c: TONES[b.row % TONES.length], t: 0 });
    } else score += 5;
    if (score > best) {
      best = score;
      saveBest(best);
    }
    hud();
  };

  const step = (dt: number) => {
    // Paddle: keys move it; the pointer sets it directly (in the pointer handlers).
    const move = (narrow ? 520 : 760) * dt;
    if (keys.left) paddle.x -= move;
    if (keys.right) paddle.x += move;
    paddle.x = Math.min(Math.max(paddle.x, paddle.w / 2), W - paddle.w / 2);

    if (phase === "ready") {
      parkBall();
      return;
    }
    if (phase !== "playing") return;

    // Sub-steps no longer than the ball's radius, so it never tunnels through a brick.
    const dist = Math.hypot(ball.vx, ball.vy) * dt;
    const n = Math.max(1, Math.ceil(dist / (ball.r * 0.8)));
    for (let i = 0; i < n && phase === "playing"; i++) {
      ball.x += (ball.vx * dt) / n;
      ball.y += (ball.vy * dt) / n;

      // Walls
      if (ball.x < ball.r) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > W - ball.r) {
        ball.x = W - ball.r;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < ball.r) {
        ball.y = ball.r;
        ball.vy = Math.abs(ball.vy);
      }

      // Paddle: the further from its centre, the steeper the bounce.
      const top = paddle.y - paddle.h / 2;
      if (ball.vy > 0 && ball.y + ball.r >= top && ball.y - ball.r <= paddle.y + paddle.h / 2 && Math.abs(ball.x - paddle.x) <= paddle.w / 2 + ball.r) {
        const off = Math.max(-1, Math.min(1, (ball.x - paddle.x) / (paddle.w / 2)));
        const angle = off * (Math.PI / 3);
        const v = Math.min(Math.hypot(ball.vx, ball.vy) * 1.012, ballSpeed() * 1.35);
        ball.vx = v * Math.sin(angle);
        ball.vy = -v * Math.cos(angle);
        ball.y = top - ball.r;
      }

      // Bricks: one per sub-step, bounced off the side it went in through.
      for (const b of bricks) {
        const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
        const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
        const dx = ball.x - cx;
        const dy = ball.y - cy;
        if (dx * dx + dy * dy > ball.r * ball.r) continue;
        const overlapX = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
        const overlapY = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
        if (overlapX < overlapY) {
          ball.vx = ball.x < b.x + b.w / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
        } else {
          ball.vy = ball.y < b.y + b.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
        }
        hitBrick(b);
        break;
      }

      // A ball that only moves sideways would never come down: give it some fall.
      if (Math.abs(ball.vy) < ballSpeed() * 0.22) ball.vy = Math.sign(ball.vy || 1) * ballSpeed() * 0.22;

      if (bricks.length === 0) {
        level += 1;
        buildWall();
        phase = "ready";
        parkBall();
        say(`Wall ${level - 1} down · Wall ${level}`, 1800);
        hud();
        return;
      }

      if (ball.y - ball.r > H) {
        lives -= 1;
        if (lives <= 0) {
          phase = "over";
          say("", 0);
        } else {
          phase = "ready";
          parkBall();
          say(lives === 1 ? "Last ball" : `${lives} balls left`, 1400);
        }
        hud();
        return;
      }
    }
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

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };

  const text = (s: string, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px ${mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.toUpperCase(), W / 2, y);
  };

  const draw = (now: number) => {
    // Field with a faint drafting grid.
    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(236, 230, 218, 0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < W; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 40; y < H; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Bricks; a two-hit brick shows a crack line until it is hit.
    for (const b of bricks) {
      ctx.fillStyle = TONES[b.row % TONES.length];
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(b.x, b.y + b.h - 3, b.w, 3);
      if (b.hp > 1) {
        ctx.strokeStyle = "rgba(20, 19, 17, 0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 9);
      }
    }

    // Broken bricks fade out.
    flashes = flashes.filter((f) => f.t < 1);
    for (const f of flashes) {
      ctx.globalAlpha = 1 - f.t;
      ctx.fillStyle = f.c;
      const grow = f.t * 6;
      ctx.fillRect(f.x - grow, f.y - grow / 2, f.w + grow * 2, f.h + grow);
      ctx.globalAlpha = 1;
    }

    // Paddle: a steel beam.
    ctx.fillStyle = CHALK;
    roundRect(paddle.x - paddle.w / 2, paddle.y - paddle.h / 2, paddle.w, paddle.h, 2);
    ctx.fill();
    ctx.fillStyle = CHALK_DIM;
    ctx.fillRect(paddle.x - paddle.w / 2, paddle.y + paddle.h / 2 - 3, paddle.w, 3);

    // Ball, with a soft ring.
    if (phase !== "over") {
      ctx.fillStyle = "rgba(255, 106, 61, 0.18)";
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = SIGNAL;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Messages
    const s = narrow ? 13 : 15;
    if (phase === "over") {
      ctx.fillStyle = "rgba(20, 19, 17, 0.72)";
      ctx.fillRect(0, 0, W, H);
      text("Game over", H / 2 - 40, s * 2.4, CHALK);
      text(`Score ${score.toLocaleString()} · best ${best.toLocaleString()}`, H / 2 + 6, s, CHALK_DIM);
      text(narrow ? "Tap to play again" : "Click or press Space to play again", H / 2 + 40, s, SIGNAL);
    } else if (phase === "paused") {
      ctx.fillStyle = "rgba(20, 19, 17, 0.6)";
      ctx.fillRect(0, 0, W, H);
      text("Paused", H / 2 - 14, s * 2, CHALK);
      text(narrow ? "Tap to carry on" : "Press Space or P to carry on", H / 2 + 26, s, CHALK_DIM);
    } else if (now < bannerUntil && banner) {
      text(banner, H * 0.62, s, CHALK);
    } else if (phase === "ready") {
      text(narrow ? "Tap to launch" : "Click or press Space to launch", H * 0.62, s, CHALK_DIM);
    }
  };

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    step(dt);
    for (const f of flashes) f.t += dt * 4;
    draw(now);
    raf = requestAnimationFrame(frame);
  };

  // ---------------------------------------------------------------- input
  const toGame = (clientX: number) => {
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left - offX) / scale;
  };

  const primary = () => {
    if (phase === "over") newGame();
    else if (phase === "paused") api.resume();
    else if (phase === "ready") launch();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = true;
    else if (k === "arrowright" || k === "d") keys.right = true;
    else if (k === " " || k === "arrowup" || k === "enter") {
      // Space or Enter on a focused button presses that button instead.
      if ((e.target as Element).closest("button")) return;
      primary();
    } else if (k === "p") api.togglePause();
    else return;
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") keys.left = false;
    if (k === "arrowright" || k === "d") keys.right = false;
  };

  let dragging = false;
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || dragging) paddle.x = toGame(e.clientX);
  };
  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    paddle.x = toGame(e.clientX);
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: PointerEvent) => {
    dragging = false;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  // A click or a tap (not a long drag) launches.
  let downAt = 0;
  const onDown = () => (downAt = performance.now());
  const onClick = () => {
    if (performance.now() - downAt < 300) primary();
  };
  const onBlur = () => api.pause();
  const onVisibility = () => document.hidden && api.pause();

  const keyTarget = canvas.closest("dialog") ?? window;
  keyTarget.addEventListener("keydown", onKeyDown as EventListener);
  keyTarget.addEventListener("keyup", onKeyUp as EventListener);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("click", onClick);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);
  const ro = new ResizeObserver(resize);
  ro.observe(box);

  const api: BrickBreaker = {
    pause() {
      if (phase === "playing" || phase === "ready") {
        pausedFrom = phase;
        phase = "paused";
        keys.left = keys.right = false;
        hud();
      }
    },
    resume() {
      if (phase === "paused") {
        phase = pausedFrom;
        last = performance.now();
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
      keyTarget.removeEventListener("keyup", onKeyUp as EventListener);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("click", onClick);
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
