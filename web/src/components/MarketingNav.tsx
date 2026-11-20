import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { goToDashboard } from '../utils/goToDashboard.ts';
import ButtonArrow from './ButtonArrow.tsx';
import { useSmoothScroll } from '../hooks/useSmoothScroll.ts';

/** The landing-page section the nav's "How it works" link scrolls to. */
export const HOW_IT_WORKS_ID = 'features-v2';

function MarketingNav() {
  // Every marketing page renders the nav, so it switches on smooth scrolling for all of them.
  useSmoothScroll();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const goDash = () => goToDashboard(navigate);
  // On phones the links collapse into a menu under the bar.
  const [menuOpen, setMenuOpen] = useState(false);

  // "How it works" is a section of the landing page; from any other page, go there first and
  // let LandingPage scroll to the hash once it has mounted.
  const goHowItWorks = () => {
    setMenuOpen(false);
    if (pathname === '/') {
      document.getElementById(HOW_IT_WORKS_ID)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(`/#${HOW_IT_WORKS_ID}`);
  };

  return (
    <nav className={`lp-nav${menuOpen ? ' open' : ''}`}>
      <button className="lp-nav-logo" aria-label="Cherrytree home" onClick={() => navigate('/')}>
        <svg
          className="lp-nav-logo-mark"
          viewBox="23 23 81 66"
          width={30}
          height={24}
          aria-hidden="true"
        >
          <path
            d="M44 62 Q46 38 62 28 M82 62 Q84 38 100 28"
            fill="none"
            stroke="currentColor"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <circle cx={38} cy={74} r={14} fill="currentColor" />
          <circle cx={76} cy={74} r={14} fill="currentColor" />
        </svg>
      </button>
      <ul className="lp-nav-links" id="lp-nav-menu">
        <li>
          <button type="button" onClick={goHowItWorks}>
            How it works
          </button>
        </li>
        <li>
          <a href="/pricing">Pricing</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        {/* Sign in moves into the menu on phones, where the bar has no room for it. */}
        <li className="lp-nav-menu-only">
          <a href="/login">Sign in</a>
        </li>
      </ul>
      <div className="lp-nav-right">
        <button className="lp-nav-signin" onClick={() => navigate('/login')}>
          Sign in
        </button>
        <button className="lp-nav-cta" onClick={goDash}>
          <span className="lp-btn-label">Get started</span>
          <ButtonArrow />
        </button>
        <button
          type="button"
          className="lp-nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="lp-nav-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

export default MarketingNav;
