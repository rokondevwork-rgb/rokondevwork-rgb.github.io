/**
 * Floors on phones and tablets: a [data-swipe] row inside a floor is drawn as cards that slide
 * sideways (global.css, "One floor per window"), so the whole floor fits one screen. This adds
 * the pager under each row: previous / next, one dot per card, and a "02 / 06" count.
 * The pager hides itself whenever the row is not scrolling sideways (desktop, or every card
 * already in view), so wide screens never see it.
 */

const still = matchMedia("(prefers-reduced-motion: reduce)");
const pad = (n: number) => String(n).padStart(2, "0");

function arrow(label: string, d: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "swipe-step";
  button.setAttribute("aria-label", label);
  button.innerHTML = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><path d="${d}"></path></svg>`;
  return button;
}

export function initSwipePagers(root: ParentNode = document) {
  for (const track of root.querySelectorAll<HTMLElement>(".lvl [data-swipe]")) {
    if (track.dataset.swipeReady) continue;
    track.dataset.swipeReady = "";

    // Cards are the marked children when the row has wrappers; otherwise its own children.
    const marked = [...track.querySelectorAll<HTMLElement>("[data-slide]")];
    const slides = marked.length ? marked : [...track.children].filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName !== "SCRIPT");
    if (slides.length < 2) continue;

    const noun = track.dataset.swipe || "Card";
    const pager = document.createElement("div");
    pager.className = "swipe-pager mono";
    pager.hidden = true;
    const prev = arrow(`Previous ${noun.toLowerCase()}`, "M10 3L5 8l5 5");
    const next = arrow(`Next ${noun.toLowerCase()}`, "M6 3l5 5-5 5");
    const dots = document.createElement("span");
    dots.className = "swipe-dots";
    const dotButtons = slides.map((_, k) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "swipe-dot";
      dot.setAttribute("aria-label", `${noun} ${k + 1} of ${slides.length}`);
      dot.addEventListener("click", () => go(k));
      dots.append(dot);
      return dot;
    });
    const count = document.createElement("span");
    count.className = "swipe-count";
    count.setAttribute("aria-hidden", "true");
    pager.append(prev, dots, next, count);
    track.after(pager);

    const atStart = () => track.scrollLeft <= 2;
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    const current = () => {
      if (atEnd()) return slides.length - 1;
      const left = track.getBoundingClientRect().left;
      let best = 0;
      let gap = Infinity;
      slides.forEach((slide, k) => {
        const d = Math.abs(slide.getBoundingClientRect().left - left);
        if (d < gap) {
          gap = d;
          best = k;
        }
      });
      return best;
    };
    // An absolute target: a relative scroll (scrollBy) would stop at the very next card,
    // since every card is a mandatory stop.
    const go = (k: number) => {
      const slide = slides[Math.max(0, Math.min(slides.length - 1, k))];
      const left = track.scrollLeft + slide.getBoundingClientRect().left - track.getBoundingClientRect().left;
      track.scrollTo({ left, behavior: still.matches ? "auto" : "smooth" });
    };

    let shown = -1;
    let queued = false;
    const update = () => {
      queued = false;
      pager.hidden = track.scrollWidth <= track.clientWidth + 2;
      if (pager.hidden) return;
      prev.disabled = atStart();
      next.disabled = atEnd();
      const k = current();
      if (k === shown) return;
      shown = k;
      dotButtons.forEach((dot, i) => dot.toggleAttribute("aria-current", i === k));
      count.textContent = `${pad(k + 1)} / ${pad(slides.length)}`;
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };

    prev.addEventListener("click", () => go(current() - 1));
    next.addEventListener("click", () => go(current() + 1));
    track.addEventListener("scroll", queue, { passive: true });
    new ResizeObserver(queue).observe(track);
    update();
  }
}
