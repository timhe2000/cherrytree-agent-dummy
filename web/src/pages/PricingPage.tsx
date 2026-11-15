import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../hooks/usePageMeta.ts';
import MarketingNav from '../components/MarketingNav.tsx';
import MarketingFooter from '../components/MarketingFooter.tsx';
import MarketingGrain from '../components/MarketingGrain.tsx';
import PlanCards from '../components/PlanCards.tsx';
import FaqList, { type Faq } from '../components/FaqList.tsx';
import { goToDashboard } from '../utils/goToDashboard.ts';
import { MARKETING_PLANS } from '../constants/pricing.ts';

interface CompareRow {
  label: string;
  /** Standard / Custom */
  b: boolean;
  s: boolean;
}

const COMPARE_ROWS: readonly CompareRow[] = [
  { label: 'Complete 10-section agreement', b: true, s: true },
  { label: 'Covers all your cofounders', b: true, s: true },
  { label: 'Email support', b: true, s: true },
  { label: 'Volume pricing', b: false, s: true },
  { label: 'Portfolio dashboard', b: false, s: true },
  { label: 'Branded experience', b: false, s: true },
  { label: 'Dedicated account support', b: false, s: true },
];

const FAQS: readonly Faq[] = [
  {
    q: 'Which plan is right for me?',
    a: "If you're a founding team, get Standard. You tell us about your company in your own words and receive a ready-to-use cofounder agreement. If you're an accelerator, VC or university that wants agreements for the teams you back, talk to us about Custom.",
  },
  {
    q: 'Is the price per agreement or per person?',
    a: 'The price covers one agreement. You can add as many cofounders as you want, even on the Standard plan. Only one person pays and answers the questions; your cofounders review the draft before signing. A new company later needs a separate purchase.',
  },
  {
    q: 'Can we buy for a whole cohort or portfolio?',
    a: "Yes. Custom gives accelerators, VCs and universities volume pricing for every team, a dashboard to track each team's progress and a branded experience. Contact sales and we'll set you up.",
  },
  {
    q: 'Do we pay again to edit later?',
    a: 'No, edit all you want. The only repeat cost is if you create a brand-new agreement for a different company.',
  },
];

function Check({ on }: { on: boolean }) {
  if (!on) return <span className="lp-sr-only">Not included</span>;
  return (
    <span className="lp-ppt-check" aria-label="Included">
      ✓
    </span>
  );
}

function PricingPage() {
  const navigate = useNavigate();
  // Protect CTA: the green highlight behind "peace of mind." sweeps in once, when scrolled into view.
  const protectHeadlineRef = useRef<HTMLHeadingElement>(null);
  const [protectInView, setProtectInView] = useState(false);

  usePageMeta({
    title: 'Pricing — Cherrytree',
    description:
      'Affordable cofounder agreement pricing. Standard at $49, Custom priced on request.',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Pricing' }],
  });

  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(faqSchema);
    s.id = 'faq-schema';
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById('faq-schema');
      if (el) document.head.removeChild(el);
    };
  }, []);

  // Trigger the highlight once, the first time the headline scrolls into view.
  useEffect(() => {
    const el = protectHeadlineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);
            setProtectInView(true);
          }
        });
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const goDash = () => goToDashboard(navigate);

  return (
    <div className="lp lp-has-curtain" style={{ minHeight: '100vh' }}>
      <MarketingGrain />
      <MarketingNav />

      {/* Raised page layer with a rounded bottom that scrolls up to reveal the footer. */}
      <div className="lp-curtain">
        {/* Hero */}
        <section className="lp-pricing-pg-hero">
          <h1 className="lp-pricing-pg-h1">Pricing</h1>
          <p className="lp-pricing-pg-sub">
            Choose the plan that's right for your team. No subscriptions, no surprises.
          </p>
        </section>

        {/* Cards */}
        <section className="lp-pricing-pg-cards-wrap">
          <PlanCards plans={MARKETING_PLANS} onStart={goDash} />
        </section>

        {/* Compare table */}
        <section className="lp-pricing-pg-compare">
          <table className="lp-pricing-pg-table">
            <thead>
              <tr>
                <th className="lp-ppt-feature-col">Compare plans</th>
                <th>Standard</th>
                <th>Custom</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, ri) => (
                <tr key={ri} className="lp-ppt-row">
                  <td className="lp-ppt-label">{row.label}</td>
                  <td>
                    <Check on={row.b} />
                  </td>
                  <td>
                    <Check on={row.s} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section className="lp-faq">
          <div className="lp-faq-inner">
            <div className="lp-faq-card">
              <div className="lp-faq-visual">
                <h2>Frequently asked questions.</h2>
              </div>
              <div className="lp-faq-panel">
                <FaqList faqs={FAQS} />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="lp-protect-cta">
          <h2 ref={protectHeadlineRef}>
            <span className="lp-hl-line">
              <span className="lp-hl-inner">Protect your piece of the pie</span>
            </span>
            <span className="lp-hl-line">
              <span className="lp-hl-inner">
                and your{' '}
                <span className={`lp-hl-mark${protectInView ? ' in' : ''}`}>peace of mind.</span>
              </span>
            </span>
          </h2>
          <div className="lp-protect-cta-actions">
            <button className="lp-btn-primary" onClick={goDash}>
              Get started
            </button>
          </div>
        </section>
      </div>

      <MarketingFooter />
    </div>
  );
}

export default PricingPage;
