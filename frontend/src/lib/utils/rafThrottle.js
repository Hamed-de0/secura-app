// Simple rAF throttle (falls back to setTimeout in tests/SSR)
export default function rafThrottle(fn) {
  let ticking = false;
  let lastArgs = null;

  function frame() {
    ticking = false;
    // eslint-disable-next-line prefer-spread
    fn.apply(null, lastArgs);
    lastArgs = null;
  }

  return function throttled(/* ...args */) {
    lastArgs = arguments;
    if (ticking) return;
    ticking = true;
    const raf = (typeof window !== 'undefined' && window.requestAnimationFrame)
      ? window.requestAnimationFrame
      : (cb) => setTimeout(cb, 16);
    raf(frame);
  };
}
