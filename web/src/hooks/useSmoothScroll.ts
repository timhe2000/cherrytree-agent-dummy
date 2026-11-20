import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/** The running smooth scroller, if any, so section links can glide the same way. */
let active: Lenis | null = null;

/**
 * Smooth wheel scrolling on the marketing pages (like causal.so): each wheel notch glides to rest
 * instead of jumping. It still moves the window's real scroll position, so sticky and scroll-driven
 * effects keep working. Touch scrolling stays native; skipped with reduced motion and where the
 * browser lacks what Lenis needs (tests).
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (
      typeof ResizeObserver === 'undefined' ||
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
    )
      return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    active = lenis;
    return () => {
      lenis.destroy();
      if (active === lenis) active = null;
    };
  }, []);
}

/** Scrolls to an element, gliding with the smooth scroller when it's running. */
export function smoothScrollTo(el: HTMLElement) {
  if (active) active.scrollTo(el);
  else el.scrollIntoView({ behavior: 'smooth' });
}
