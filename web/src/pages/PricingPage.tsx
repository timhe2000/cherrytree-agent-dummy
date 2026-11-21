import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../hooks/usePageMeta.ts';
import MarketingNav from '../components/MarketingNav.tsx';
import MarketingFooter from '../components/MarketingFooter.tsx';
import PlanCards from '../components/PlanCards.tsx';
import ProtectCta from '../components/ProtectCta.tsx';
import FaqList, { type Faq } from '../components/FaqList.tsx';
import { goToDashboard } from '../utils/goToDashboard.ts';
import { MARKETING_PLANS } from '../constants/pricing.ts';

/** A cell is a tick (`true`), "not included" (`false`) or a short value such as a price. */
type CompareCell = boolean | string;

interface CompareRow {
  label: string;
  standard: CompareCell;
  custom: CompareCell;
}

const COMPARE_ROWS: readonly CompareRow[] = [
  { label: 'Price', standard: '$49, one-time', custom: 'Volume pricing' },
  {
    label: 'Who it’s for',
    standard: 'One founding team',
    custom: 'Accelerators, VCs, universities',
  },
  { label: 'Agreements included', standard: 'One company', custom: 'One per team you back' },
  { label: 'Answer in your own words', standard: true, custom: true },
  { label: 'Smart follow-up questions', standard: true, custom: true },
  { label: 'Equity split guidance', standard: true, custom: true },
  { label: 'Complete cofounder agreement', standard: true, custom: true },
  { label: 'Downloadable PDF agreement', standard: true, custom: true },
  { label: 'Dedicated account manager', standard: false, custom: true },
  { label: 'Track every team’s progress', standard: false, custom: true },
  { label: 'Branded for your program', standard: false, custom: true },
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

function Cell({ value }: { value: CompareCell }) {
  if (typeof value === 'string') return <>{value}</>;
  if (!value)
    return (
      <>
        <span className="lp-ppt-none" aria-hidden="true">
          —
        </span>
        <span className="lp-sr-only">Not included</span>
      </>
    );
  return (
    <span className="lp-ppt-check" aria-label="Included">
      ✓
    </span>
  );
}

/** Every row of the compare table in one list. */
function CompareTable() {
  return (
    <div className="lp-ppt-card">
      <table className="lp-ppt-table">
        <thead>
          <tr>
            <th className="lp-ppt-feature-col">
              <span className="lp-sr-only">Feature</span>
            </th>
            <th>Standard</th>
            <th>Custom</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((row) => (
            <tr key={row.label} className="lp-ppt-row">
              <td className="lp-ppt-label">{row.label}</td>
              <td>
                <Cell value={row.standard} />
              </td>
              <td>
                <Cell value={row.custom} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingPage() {
  const navigate = useNavigate();

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

  const goDash = () => goToDashboard(navigate);

  return (
    <div className="lp lp-has-curtain" style={{ minHeight: '100vh' }}>
      <MarketingNav />

      {/* Raised page layer with a rounded bottom that scrolls up to reveal the footer. */}
      <div className="lp-curtain">
        {/* Hero: the title stays put while the sheet below, led by the plan cards, slides up over it. */}
        <section className="lp-pricing-pg-hero lp-hero-pinned">
          <h1 className="lp-pricing-pg-h1">Vest assured.</h1>
        </section>

        <div className="lp-sheet">
          {/* Cards */}
          <section className="lp-pricing-pg-cards-wrap">
            <PlanCards plans={MARKETING_PLANS} onStart={goDash} />
          </section>

          {/* Compare table */}
          <section className="lp-pricing-pg-compare">
            <div className="lp-ppt">
              <h2 className="lp-ppt-title">Compare plans</h2>
              <CompareTable />
            </div>
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

          <ProtectCta onStart={goDash} />
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}

export default PricingPage;
