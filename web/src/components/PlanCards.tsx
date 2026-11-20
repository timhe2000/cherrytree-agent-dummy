import type { CSSProperties } from 'react';

import type { MarketingPlan } from '../constants/pricing.ts';
import { openContactForm } from '../utils/openContactForm.ts';
import ButtonArrow from './ButtonArrow.tsx';

/**
 * The marketing plan cards (landing and pricing pages): every plan on one white card, each with a
 * grainy beige price panel, its button, then its features.
 */
function PlanCards({
  plans,
  onStart,
}: {
  plans: readonly MarketingPlan[];
  /** Get started (plans without `contactSales`, which open the contact form). */
  onStart: () => void;
}) {
  return (
    <div className="lp-pw" style={{ '--pw-cols': plans.length } as CSSProperties}>
      {plans.map((plan) => (
        <article key={plan.tier} className="lp-pw-card">
          <div className="lp-pw-panel">
            <h3 className="lp-pw-tier">{plan.tier}</h3>
            <div className="lp-pw-price">
              {plan.price}
              {plan.price.startsWith('$') && <span>one-time</span>}
            </div>
          </div>
          <button
            className="lp-btn-primary lp-plan-cta"
            onClick={plan.contactSales ? openContactForm : onStart}
          >
            <span className="lp-btn-label">{plan.cta}</span>
            <ButtonArrow />
          </button>
          <ul className="lp-pw-features">
            {plan.features.map((f) => (
              <li key={f}>
                <span className="lp-pw-tick" aria-hidden="true">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default PlanCards;
