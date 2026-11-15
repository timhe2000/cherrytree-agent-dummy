import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../hooks/usePageMeta.ts';
import MarketingNav from '../components/MarketingNav.tsx';
import MarketingFooter from '../components/MarketingFooter.tsx';
import MarketingGrain from '../components/MarketingGrain.tsx';
import ScrollLitStatement from '../components/ScrollLitStatement.tsx';

const LIT_CHERRIES =
  'Cherries rarely grow alone. They come in twos, in threes, and in bunches, just like cofounders.';

/** Numbered points under the cherry statement. Placeholder copy, to be replaced. */
const POINTS: readonly { title: string; body: string }[] = [
  { title: 'Point one headline', body: 'One or two sentences that expand on point one go here.' },
  { title: 'Point two headline', body: 'One or two sentences that expand on point two go here.' },
  {
    title: 'Point three headline',
    body: 'One or two sentences that expand on point three go here.',
  },
  { title: 'Point four headline', body: 'One or two sentences that expand on point four go here.' },
  { title: 'Point five headline', body: 'One or two sentences that expand on point five go here.' },
  { title: 'Point six headline', body: 'One or two sentences that expand on point six go here.' },
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
          <h1>We&rsquo;re in good company.</h1>
          <div className="lp-about-hero-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/contact')}>
              Contact us
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
      </div>

      <MarketingFooter />
    </div>
  );
}

export default AboutPage;
