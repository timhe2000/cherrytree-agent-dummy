import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MarketingFooter() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  // On the reveal pages the footer is pinned to the bottom of the screen behind the page, but only
  // once the page's bottom edge is on screen. Pinned all the time, it's a dark sticky element on
  // the screen's bottom edge, which Safari 26 takes as the color for its bottom toolbar area,
  // so the page looked cut off by a black bar.
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const curtain = ref.current?.previousElementSibling;
    if (!curtain?.classList.contains('lp-curtain')) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setPinned(curtain.getBoundingClientRect().bottom <= window.innerHeight + 1);
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
  }, []);

  return (
    <footer className={`lp-footer${pinned ? ' lp-footer-pinned' : ''}`} ref={ref}>
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
    </footer>
  );
}

export default MarketingFooter;
