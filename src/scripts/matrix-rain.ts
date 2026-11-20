/**
 * The intercom's `hake` easter egg: green letters rain down over the whole page, Matrix style.
 * The page stays where it is underneath, a little darker. Esc, a click or a tap ends it, and it
 * fades out by itself after a minute. Callers skip it when the visitor prefers reduced motion.
 */

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789অআইকখগঘচছজঝটঠডঢণতথদধনপফবভম{}<>=$#";
const RUN_MS = 60000;
const FADE_MS = 600;

let stopCurrent: (() => void) | null = null;

export function startMatrixRain(): () => void {
  stopCurrent?.();

  const overlay = document.createElement("div");
  overlay.className = "matrix-overlay";
  overlay.setAttribute("role", "presentation");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const note = document.createElement("p");
  note.className = "matrix-note mono";
  note.setAttribute("role", "status");
  const coarse = matchMedia("(pointer: coarse)").matches;
  note.innerHTML = `<span>Wake up, visitor…</span><span>${coarse ? "Tap anywhere to come back" : "Esc, click or tap to come back"} · ends by itself in 1 min</span>`;
  overlay.append(canvas, note);
  document.body.append(overlay);

  const ctx = canvas.getContext("2d")!;
  let w = 0;
  let h = 0;
  let size = 16;
  type Column = { y: number; speed: number; trail: number; chars: string[]; alpha: number };
  let columns: Column[] = [];
  const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    size = w < 640 ? 14 : 16;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.ceil(w / (size + 4));
    const rows = Math.ceil(h / size) + 2;
    columns = Array.from({ length: count }, (_, i) => columns[i] ?? {
      // Some columns are already part-way down as it fades in, the rest start above the screen.
      y: rows * (Math.random() - 0.6),
      speed: 8 + Math.random() * 14, // rows per second
      trail: 8 + Math.floor(Math.random() * 22),
      chars: Array.from({ length: rows }, pick),
      alpha: 0.55 + Math.random() * 0.45,
    });
    for (const c of columns) while (c.chars.length < rows) c.chars.push(pick());
  };
  resize();

  const font = `500 ${size}px "Hiragino Sans", "Yu Gothic", "Noto Sans JP", "Noto Sans Bengali", "Nirmala UI", monospace`;
  let last = performance.now();
  let raf = 0;

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, w, h);
    ctx.font = font.replace(/\d+px/, `${size}px`);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const rows = Math.ceil(h / size) + 2;
    columns.forEach((c, i) => {
      c.y += c.speed * dt;
      if (c.y - c.trail > rows) {
        c.y = -Math.random() * 10;
        c.speed = 8 + Math.random() * 14;
        c.trail = 8 + Math.floor(Math.random() * 22);
      }
      // Now and then a letter in the trail flickers to another one.
      if (Math.random() < 0.08) c.chars[Math.floor(Math.random() * c.chars.length)] = pick();
      const x = i * (size + 4) + (size + 4) / 2;
      const head = Math.floor(c.y);
      for (let k = 0; k <= c.trail; k++) {
        const row = head - k;
        if (row < 0 || row >= rows) continue;
        const fade = 1 - k / c.trail;
        if (k === 0) {
          ctx.fillStyle = `rgba(233, 255, 233, ${c.alpha})`;
          ctx.shadowColor = "#b6ffc4";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(0, 255, 65, ${(c.alpha * fade).toFixed(3)})`;
          ctx.shadowColor = "rgba(0, 255, 65, 0.5)";
          ctx.shadowBlur = k < 4 ? 6 : 0;
        }
        ctx.fillText(c.chars[row % c.chars.length], x, row * size);
      }
    });
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  requestAnimationFrame(() => overlay.classList.add("is-on"));

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    removeEventListener("keydown", onKey, true);
    removeEventListener("resize", resize);
    overlay.classList.remove("is-on");
    setTimeout(() => {
      cancelAnimationFrame(raf);
      overlay.remove();
    }, FADE_MS);
    if (stopCurrent === stop) stopCurrent = null;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      stop();
    }
  };
  addEventListener("keydown", onKey, true);
  addEventListener("resize", resize);
  overlay.addEventListener("pointerdown", stop);
  const timer = setTimeout(stop, RUN_MS);

  stopCurrent = stop;
  return stop;
}
