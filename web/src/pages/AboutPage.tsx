import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../hooks/usePageMeta.ts';
import MarketingNav from '../components/MarketingNav.tsx';
import MarketingFooter from '../components/MarketingFooter.tsx';
import MarketingGrain from '../components/MarketingGrain.tsx';
import ScrollLitStatement from '../components/ScrollLitStatement.tsx';
import ProtectCta from '../components/ProtectCta.tsx';
import { goToDashboard } from '../utils/goToDashboard.ts';
import { openContactForm } from '../utils/openContactForm.ts';

const LIT_CHERRIES =
  'Cherries rarely grow alone. They come in twos, in threes, and in bunches, just like cofounders.';

/** Why Cherrytree exists: numbered points under the cherry statement. */
const POINTS: readonly { title: string; body: string }[] = [
  {
    title: 'Most startups self-destruct',
    body: 'Cofounder conflict kills 65% of startups, per HBS professor Noam Wasserman.',
  },
  {
    title: 'Handshakes feel easier',
    body: 'Cofounders avoid the awkward talks, so they shake hands and hope for the best.',
  },
  {
    title: 'The options are broken',
    body: 'Generic templates miss the details and lawyers price out early-stage teams.',
  },
  {
    title: 'We’ve been there, done that',
    body: 'Having founded companies and coached hundreds, we saw the same patterns.',
  },
  {
    title: 'So we built Cherrytree',
    body: 'Great companies start with great company. Get it right from the beginning.',
  },
];

function AboutPage() {
  const navigate = useNavigate();
  usePageMeta({
    title: 'About Cherrytree — Fair Cofounder Agreements for Startups',
    description:
      'Learn how Cherrytree helps early-stage cofounders create fair agreements that protect both equity stakes and relationships. Built by founders, for founders.',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About' }],
  });

  return (
    <div className="lp lp-has-curtain lp-about-page">
      <MarketingGrain />
      <MarketingNav />

      {/* Raised page layer with a rounded bottom that scrolls up to reveal the footer. */}
      <div className="lp-curtain">
        <section className="lp-about-hero">
          <h1>You&rsquo;re in good company.</h1>
          <div className="lp-about-hero-actions">
            <button className="lp-btn-primary" onClick={openContactForm}>
              <span className="lp-btn-label">Contact us</span>
            </button>
          </div>
        </section>

        {/* Sections reuse the landing's section classes so the spacing matches it exactly. */}
        {/* The blossom valley painting on its own (same panel as the landing's). */}
        <section className="lp-features">
          <div className="lp-feat-scroll">
            <div
              className="lp-feat-v2-scene"
              role="img"
              aria-label="Painting of a cherry tree in a blossoming valley"
            >
              <div className="lp-feat-v2-grain" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="lp-features">
          <div className="lp-feat-header lp-lit-header">
            <ScrollLitStatement text={LIT_CHERRIES} />
          </div>
          <ol className="lp-feat-scroll lp-about-points">
            {POINTS.map((point, i) => (
              <li key={point.title} className="lp-about-point">
                <span className="lp-about-point-num">{i + 1}</span>
                <h3 className="lp-about-point-title">{point.title}</h3>
                <span className="lp-about-point-rule" aria-hidden="true" />
                <p className="lp-about-point-body">{point.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <ProtectCta onStart={() => goToDashboard(navigate)} />
      </div>

      <MarketingFooter />
    </div>
  );
}

export default AboutPage;
