import ButtonArrow from './ButtonArrow.tsx';

/**
 * The closing "Protect your piece of the pie and your peace of mind." call to action on the
 * marketing pages (landing, pricing, about).
 */
function ProtectCta({
  onStart,
}: {
  /** Get started. */
  onStart: () => void;
}) {
  return (
    <section className="lp-protect-cta">
      <h2>
        <span className="lp-hl-line">
          <span className="lp-hl-inner">Protect your piece of the pie</span>
        </span>{' '}
        <span className="lp-hl-line">
          <span className="lp-hl-inner">and your peace of mind.</span>
        </span>
      </h2>
      <div className="lp-protect-cta-actions">
        <button className="lp-btn-primary" onClick={onStart}>
          <span className="lp-btn-label">Get started</span>
          <ButtonArrow />
        </button>
      </div>
    </section>
  );
}

export default ProtectCta;
