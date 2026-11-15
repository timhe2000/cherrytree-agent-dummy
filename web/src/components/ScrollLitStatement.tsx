import { useEffect, useRef, useState } from 'react';

/**
 * A big serif statement whose words light up one by one as it scrolls up the screen (landing and
 * About pages). Wrap it in `.lp-feat-header` for the statement styling.
 */
function ScrollLitStatement({ text }: { text: string }) {
  const words = text.split(' ');
  const ref = useRef<HTMLHeadingElement>(null);
  // With reduced motion the whole statement is lit from the start and never animates.
  const [reducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const lit = Math.round(progress * words.length);
  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      // Starts lighting as the text's top passes 80% down the screen; done by 30%.
      const progress = (vh * 0.8 - el.getBoundingClientRect().top) / (vh * 0.5);
      setProgress(Math.min(1, Math.max(0, progress)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <h2 className="lp-lit-text" ref={ref}>
      {words.map((word, i) => (
        <span key={i} className={i < lit ? 'on' : undefined}>
          {word}{' '}
        </span>
      ))}
    </h2>
  );
}

export default ScrollLitStatement;
