type SmoothScrollOptions = {
  /** Duração total da animação (ms). */
  duration?: number;
  /** Offset no topo (ex.: altura do header fixo). */
  offsetTop?: number;
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const smoothScrollToY = (targetY: number, { duration = 250 }: SmoothScrollOptions = {}) => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (prefersReducedMotion || duration <= 0) {
    window.scrollTo(0, Math.max(0, targetY));
    return;
  }

  const startY = window.scrollY || window.pageYOffset;
  const delta = targetY - startY;
  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + delta * eased);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

export const smoothScrollToHash = (hash: string, options: SmoothScrollOptions = {}) => {
  const selector = hash.startsWith('#') ? hash : `#${hash}`;
  const el = document.querySelector(selector);
  if (!el) return;

  const { offsetTop = 96 } = options;
  const rect = el.getBoundingClientRect();
  const targetY = rect.top + (window.scrollY || window.pageYOffset) - offsetTop;
  smoothScrollToY(targetY, options);
};
