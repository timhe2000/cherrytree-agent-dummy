import { useNavigate } from 'react-router-dom';

function MarketingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        <span className="lp-footer-copy">© 2026 Cherrytree</span>
        <ul className="lp-footer-links">
          <li>
            <button onClick={() => navigate('/privacy')}>Privacy</button>
          </li>
          <li>
            <button onClick={() => navigate('/terms')}>Terms</button>
          </li>
          <li>
            <button onClick={() => navigate('/contact')}>Contact</button>
          </li>
        </ul>
      </div>
      {/* A giant, faint wordmark across the bottom, cropped by the page edge. */}
      <div className="lp-footer-wordmark" aria-hidden="true">
        Cherrytree
      </div>
    </footer>
  );
}

export default MarketingFooter;
