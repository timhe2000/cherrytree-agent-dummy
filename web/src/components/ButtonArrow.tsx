/**
 * The arrow that slides out of a dark button on hover, lengthening it (`.lp-btn-primary`,
 * `.lp-nav-cta`). Goes after the button's `.lp-btn-label`; hidden from screen readers.
 */
function ButtonArrow() {
  return (
    <span className="lp-btn-arrow" aria-hidden="true">
      <svg viewBox="0 0 30 24" fill="none">
        <path
          d="M3 12h24M21 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default ButtonArrow;
