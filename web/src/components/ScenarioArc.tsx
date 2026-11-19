import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

interface Scenario {
  /** Short tab label, also the page's section heading. */
  topic: string;
  question: string;
  /** Example clause typeset on the page; **double asterisks** mark highlighted terms. */
  clause: string;
  /** Pastel the page is tinted with. */
  tint: string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    topic: 'Equity',
    question: 'Who owns what?',
    clause:
      'Equity is split **55% to Alex** and **45% to Sam**, reflecting each founder’s role, capital and time committed.',
    tint: '#c6d0c1',
  },
  {
    topic: 'Vesting',
    question: 'What if someone leaves early?',
    clause:
      'Shares vest over **four years** with a **one-year cliff**. Unvested shares return to the company.',
    tint: '#e4d4d1',
  },
  {
    topic: 'Decisions',
    question: 'Who gets the final say?',
    clause:
      'Any spend over **$10,000** needs **both founders’ approval**. Day-to-day calls rest with the role owner.',
    tint: '#ccd6df',
  },
  {
    topic: 'IP',
    question: 'Who owns the code?',
    clause:
      'All work created for the company, **including before formation**, is **assigned to the company**.',
    tint: '#ddd0bd',
  },
  {
    topic: 'Compensation',
    question: 'When do we get paid?',
    clause:
      'Salaries begin **after the first raise**, are **set equally** and are reviewed every year.',
    tint: '#d0d3b6',
  },
  {
    topic: 'Performance',
    question: 'What if someone checks out?',
    clause: 'Missed commitments start a **30-day plan** before **any change** to roles or equity.',
    tint: '#dcd3e0',
  },
];

/** Card the carousel opens on. */
const START = 2;
const N = SCENARIOS.length;
/** The row holds this many copies of the cards so it can loop; the reader stays in the middle one. */
const COPIES = 5;
const MIDDLE = Math.floor(COPIES / 2);
const CARDS = Array.from({ length: COPIES * N }, (_, i) => i);

/** On the arc, cards sit this much closer together than their slots (still never touching). */
const ARC_PULL = 0.02;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Founder questions on pages of the agreement along an arc (landing page): a sideways scroll-snap row
 * where each page drops, tilts and shrinks with its distance from the centre, so the row seems to
 * roll around a wheel. It loops: the pages repeat, and once scrolling settles outside the middle copy
 * the row jumps by a whole copy, which looks identical. Clicking a page brings it to the centre;
 * mouse users can also drag the row. The fan follows the page scroll like the lit statements: the
 * on-screen cards sit in a stack as the row comes up the screen and spread onto the arc as it rises,
 * and stack again on the way back up.
 */
function ScenarioArc() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  /** Index of the centred card across all copies. */
  const [active, setActive] = useState(MIDDLE * N + START);
  /** The last mouse press moved the row, so the click that ends it shouldn't pick a card. */
  const draggedRef = useRef(false);
  /** With reduced motion the row is always fanned and never stacks. */
  /** Turns off the scroll easing once the cards have finished easing to rest. */
  const easeOffRef = useRef(0);
  const [reducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  /** Distance between neighbouring card centres, so the arc follows the CSS gap at every width. */
  const step = useCallback(() => {
    const [first, second] = cardRefs.current;
    return first && second ? second.offsetLeft - first.offsetLeft || 1 : 1;
  }, []);

  /** Bends every card onto the arc for the current scroll position and returns the centred one. */
  const layout = useCallback(() => {
    const track = trackRef.current;
    if (!track) return MIDDLE * N + START;
    const mid = track.scrollLeft + track.clientWidth / 2;
    const gap = step();
    // How far the fan has opened: 0 while the row's top is low on the screen, 1 once it reaches 40%.
    const vh = window.innerHeight;
    const fan = reducedMotion
      ? 1
      : clamp01((vh * 0.92 - track.getBoundingClientRect().top) / (vh * 0.52));
    // Cards ease after the scroll while the fan moves. Keep the easing on until they've caught up
    // at either end, or they'd snap the last few pixels into place.
    if (fan > 0 && fan < 1) {
      window.clearTimeout(easeOffRef.current);
      easeOffRef.current = 0;
      track.classList.add('scrubbing');
    } else if (track.classList.contains('scrubbing') && !easeOffRef.current) {
      easeOffRef.current = window.setTimeout(() => {
        easeOffRef.current = 0;
        track.classList.remove('scrubbing');
      }, 600);
    }
    let nearest = 0;
    let best = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = (card.offsetLeft + card.offsetWidth / 2 - mid) / gap;
      const a = Math.min(Math.abs(d), 2.5);
      const side = Math.sign(d);
      // On the arc: pulled in towards the centre, dropped and tilted away from it. Every card stays
      // full size.
      const arcX = -d * gap * ARC_PULL;
      const arcY = 20 * a * a;
      const arcRot = 4 * side * a;
      // Only cards whose place on the arc is on screen join the stack; the rest wait out of view in
      // their places, so the fan never sends cards streaming out of frame. Outer cards leave the
      // stack a little later than inner ones.
      const onScreen =
        Math.abs(d) * gap * (1 - ARC_PULL) - card.offsetWidth / 2 < track.clientWidth / 2;
      const k = Math.min(Math.abs(d), 4);
      const t = onScreen ? easeInOut(clamp01((fan - 0.08 * k) / (1 - 0.08 * k))) : 1;
      // In the stack: on the centre card, each a little lower and turned the other way to the last.
      const stackRot = k * 2.6 * (Math.round(k) % 2 ? 1 : -1) * (side || 1);
      card.style.transform =
        `translate(${mix(-d * gap, arcX, t).toFixed(1)}px, ${mix(k * 6, arcY, t).toFixed(1)}px) ` +
        `rotate(${mix(stackRot, arcRot, t).toFixed(2)}deg)`;
      // Centre card on top, so the stack reads from the front.
      card.style.zIndex = String(50 - Math.round(Math.min(Math.abs(d), 9) * 5));
      if (Math.abs(d) < best) {
        best = Math.abs(d);
        nearest = i;
      }
    });
    return nearest;
  }, [reducedMotion, step]);

  const scrollToCard = useCallback((i: number, smooth: boolean) => {
    const track = trackRef.current;
    const card = cardRefs.current[i];
    if (!track || !card) return;
    const left = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let settle = 0;
    let dragX: number | null = null;
    let dragLeft = 0;

    // Once the row stops outside the middle copy, jump by whole copies to the same card there.
    const recentre = () => {
      if (dragX !== null) return;
      const copy = Math.floor(layout() / N);
      if (copy !== MIDDLE) track.scrollLeft += (MIDDLE - copy) * N * step();
    };
    const update = () => {
      frame = 0;
      setActive(layout());
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      window.clearTimeout(settle);
      settle = window.setTimeout(recentre, 150);
    };
    scrollToCard(MIDDLE * N + START, false);
    onScroll();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // The page scroll opens and closes the fan.
    const onPageScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onPageScroll, { passive: true });

    // Mouse drag: move the row by hand with snapping off, then snap to the nearest card.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragX = e.clientX;
      dragLeft = track.scrollLeft;
      draggedRef.current = false;
      track.classList.add('dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null) return;
      if (Math.abs(e.clientX - dragX) > 5) draggedRef.current = true;
      track.scrollLeft = dragLeft - (e.clientX - dragX);
    };
    const onUp = () => {
      if (dragX === null) return;
      dragX = null;
      track.classList.remove('dragging');
      if (draggedRef.current) scrollToCard(layout(), true);
    };
    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener('scroll', onPageScroll);
      window.clearTimeout(easeOffRef.current);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [layout, scrollToCard, step]);

  return (
    <div className="lp-arc">
      <div className="lp-arc-track" ref={trackRef}>
        {CARDS.map((i) => {
          const s = SCENARIOS[i % N]!;
          return (
            <article
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`lp-arc-card${active === i ? ' active' : ''}`}
              aria-label={s.question}
              style={{ '--arc-tint': s.tint } as CSSProperties}
              // Screen readers get one set; the copies only make the loop.
              aria-hidden={Math.floor(i / N) !== MIDDLE || undefined}
              onClick={() => {
                if (draggedRef.current) return;
                setActive(i);
                scrollToCard(i, true);
              }}
            >
              <div className="lp-feat-v2-grain" aria-hidden="true" />
              <p className="lp-arc-head">{s.topic}</p>
              <h3>{s.question}</h3>
              <p className="lp-arc-clause">
                {s.clause
                  .split('**')
                  .map((part, k) => (k % 2 ? <mark key={k}>{part}</mark> : part))}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ScenarioArc;
