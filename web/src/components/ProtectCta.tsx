import { useEffect, useRef, useState } from 'react';

/**
 * The closing "Protect your piece of the pie and your peace of mind." call to action on the
 * marketing pages (landing, pricing, about). The green highlight behind "peace of mind." sweeps
 * in once, the first time the headline scrolls into view.
 */
function ProtectCta({
  onStart,
  reveal = false,
}: {
  /** Get started. */
  onStart: () => void;
  /** Fade the button in with the page's scroll reveal (`.lp-rv`); only the landing runs one. */
  reveal?: boolean;
}) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);
            setInView(true);
          }
        });
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="lp-protect-cta">
      <h2 ref={headlineRef}>
        <span className="lp-hl-line">
          <span className="lp-hl-inner">Protect your piece of the pie</span>
        </span>{' '}
        <span className="lp-hl-line">
          <span className="lp-hl-inner">
            and your <span className={`lp-hl-mark${inView ? ' in' : ''}`}>peace of mind.</span>
          </span>
        </span>
      </h2>
      <div className={`lp-protect-cta-actions${reveal ? ' lp-rv lp-d1' : ''}`}>
        <button className="lp-btn-primary" onClick={onStart}>
          <span className="lp-btn-label">Get started</span>
        </button>
      </div>
    </section>
  );
}

export default ProtectCta;
