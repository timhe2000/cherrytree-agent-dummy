import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { breadcrumbs } from '../test/pageMeta.ts';
import LandingPage from './LandingPage.tsx';

// The marketing chrome has its own tests.
vi.mock('../components/MarketingNav', () => ({ default: () => <nav data-testid="nav" /> }));
vi.mock('../components/MarketingFooter', () => ({
  default: () => <footer data-testid="footer" />,
}));

/** jsdom has no IntersectionObserver; this one reveals what it observes on demand. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  constructor(
    private readonly callback: (
      entries: { isIntersecting: boolean; intersectionRatio: number; target: Element }[],
    ) => void,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(target: Element) {
    this.observed.push(target);
  }
  unobserve() {}
  disconnect() {}
  intersect(targets: Element[] = this.observed) {
    this.callback(
      targets.map((target) => ({
        isIntersecting: true,
        intersectionRatio: 1,
        target,
        boundingClientRect: target.getBoundingClientRect(),
      })),
    );
  }
  /** Reports the targets as fully out of view. */
  leave(targets: Element[] = this.observed) {
    this.callback(
      targets.map((target) => ({ isIntersecting: false, intersectionRatio: 0, target })),
    );
  }
}

function Location() {
  const { pathname } = useLocation();
  return <p data-testid="path">{pathname}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LandingPage />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

const path = () => screen.getByTestId('path').textContent;
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const observersFor = (threshold: number) =>
  FakeIntersectionObserver.instances.filter((o) => o.options?.threshold === threshold);

// How it works pins its scene while the page scrolls through a tall track; jsdom has no layout,
// so give the track a position and size: it starts at y=1000 and pins for 3200px (4000 − 800).
const TRACK_TOP = 1000;
const PIN_LENGTH = 3200;
function layOutTrack() {
  const track = document.querySelector<HTMLElement>('.lp-feat-v2-track')!;
  const sticky = document.querySelector<HTMLElement>('.lp-feat-v2-sticky')!;
  Object.defineProperty(track, 'offsetHeight', { configurable: true, value: PIN_LENGTH + 800 });
  Object.defineProperty(sticky, 'offsetHeight', { configurable: true, value: 800 });
  track.getBoundingClientRect = () => ({ top: TRACK_TOP - window.scrollY }) as DOMRect;
}
/** Scroll position halfway through step `index`'s share of the pinned stretch. */
const stepScrollY = (index: number) => TRACK_TOP + ((index + 0.5) / 4) * PIN_LENGTH;
function scrollPage(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(16); // the scroll handler waits a frame
  });
}
/** Scrolls the page to step `index`, which swaps in that step's demo. */
function scrollToStep(index: number) {
  layOutTrack();
  scrollPage(stepScrollY(index));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 16),
  );
  FakeIntersectionObserver.instances = [];
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('LandingPage', () => {
  it('sets the page meta without breadcrumbs', () => {
    renderPage();
    expect(document.title).toBe('Cherrytree — Build your cofounder agreement');
    expect(breadcrumbs()).toEqual([]);
  });

  it('shows the two self-serve plans', () => {
    renderPage();
    const plans = Array.from(document.querySelectorAll('#pricing .lp-pw-card'));
    expect(plans.map((p) => p.querySelector('.lp-pw-tier')?.textContent)).toEqual([
      'Standard',
      'Custom',
    ]);
    expect(plans[0]!.querySelector('.lp-pw-price')).toHaveTextContent('$49one-time');
    expect(plans[1]!.querySelector('.lp-pw-features li')).toHaveTextContent(
      'Everything included in Standard',
    );
  });

  it('lights the statement word by word as it scrolls up the screen', () => {
    renderPage();
    const text = document.querySelector<HTMLElement>('.lp-lit-text')!;
    // jsdom has no layout: the statement starts 1000px down the page.
    text.getBoundingClientRect = () => ({ top: 1000 - window.scrollY }) as DOMRect;
    const lit = () => text.querySelectorAll('span.on').length;
    const words = text.querySelectorAll('span').length;
    scrollPage(0); // below the fold
    expect(lit()).toBe(0);
    scrollPage(1000 - 800 * 0.55); // halfway through the lighting stretch
    expect(lit()).toBe(Math.round(words / 2));
    scrollPage(1000); // well past it
    expect(lit()).toBe(words);
  });

  it('sends Get started to the dashboard', () => {
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: 'Get started' })[0]!);
    expect(path()).toBe('/dashboard');
  });

  describe('features', () => {
    const tabs = () => screen.getAllByRole('tab');

    it('lists four steps and shows the brain dump demo first', () => {
      renderPage();
      expect(tabs().map((el) => el.textContent?.slice(0, 20))).toEqual([
        expect.stringContaining('Just brain dump'),
        expect.stringContaining('Smart follow-ups'),
        expect.stringContaining('We draft it'),
        expect.stringContaining('Review and sign'),
      ]);
      expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
      expect(document.querySelector('.lp-s1-chat')).toBeInTheDocument(); // brain dump demo
    });

    it('picks the step from how far the page has scrolled through the pinned stretch', () => {
      renderPage();
      scrollToStep(2);
      expect(tabs()[2]).toHaveAttribute('aria-selected', 'true');
      expect(tabs()[0]).toHaveAttribute('aria-selected', 'false');
      expect(document.querySelector('.lp-dr-paper')).toBeInTheDocument(); // drafting demo
      scrollPage(TRACK_TOP + PIN_LENGTH * 2); // past the end stays on the last step
      expect(tabs()[3]).toHaveAttribute('aria-selected', 'true');
      scrollPage(0); // above the track stays on the first
      expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('scrolls to a step when its title is clicked', () => {
      const scrollTo = vi.fn();
      vi.stubGlobal('scrollTo', scrollTo);
      renderPage();
      layOutTrack();
      fireEvent.click(tabs()[1]!);
      expect(scrollTo).toHaveBeenCalledWith({ top: stepScrollY(1), behavior: 'smooth' });
    });

    it("brain dump demo: asks what they're building, then types the founder's answer", () => {
      renderPage();
      const answer = () => document.querySelector('.lp-s1-typed')?.textContent;
      expect(document.querySelector('.lp-s1-q')?.textContent).toBe('What are you building?');
      expect(answer()).toBe('');
      advance(900 + 28 * "We're building Cherrytree".length);
      expect(answer()).toBe("We're building Cherrytree");
      advance(28 * 300);
      expect(answer()).toContain('since I put in the first $20k.');
    });

    it('follow-up demo: Cherrytree asks, the founder answers', () => {
      renderPage();
      scrollToStep(1);
      const msgs = () => Array.from(document.querySelectorAll('.lp-fu-msg'));
      advance(400);
      expect(document.querySelector('.lp-fu-typing')).toBeInTheDocument();
      advance(1100);
      expect(msgs()).toHaveLength(1);
      expect(msgs()[0]).not.toHaveClass('user');
      advance(1600);
      expect(msgs()).toHaveLength(2);
      expect(msgs()[1]).toHaveClass('user');
    });

    it('draft demo: types the agreement out', () => {
      renderPage();
      scrollToStep(2);
      const paper = () => document.querySelector('.lp-dr-paper')!;
      expect(paper().querySelector('.lp-dr-p')).toBeNull();
      advance(600 + 14 * 9);
      expect(paper().querySelector('.lp-dr-p')?.textContent).toBe('This Agre');
      advance(14 * 600); // finished typing, before it loops
      expect(Array.from(paper().querySelectorAll('.lp-dr-h')).map((h) => h.textContent)).toEqual([
        'Background',
        '1. Equity',
        '2. Vesting',
      ]);
    });

    it('sign demo: edits a line, then both cofounders sign in turn', () => {
      renderPage();
      scrollToStep(3);
      const ink = () => Array.from(document.querySelectorAll('.lp-sg-ink'), (el) => el.textContent);
      expect(document.querySelectorAll('.lp-sg-sig')).toHaveLength(2);
      advance(700);
      expect(document.querySelectorAll('.lp-sg-line.edited')).toHaveLength(1);
      expect(ink()).toEqual([]);
      advance(1200);
      expect(ink()).toEqual(['Steve Bobs']);
      advance(1100);
      expect(ink()).toEqual(['Steve Bobs', 'Avery Dates']);
    });
  });

  it('reveals scroll sections a tick after they intersect, staggering ones that come in together', () => {
    renderPage();
    const [reveal] = observersFor(0);
    expect(reveal?.options).toEqual({ threshold: 0, rootMargin: '0px 0px -15% 0px' });
    const [first, second] = reveal!.observed as HTMLElement[];
    expect(first).toHaveClass('lp-rv');
    act(() => reveal!.intersect([first!, second!]));
    expect(first).not.toHaveClass('lp-rv-in');
    advance(0);
    expect(first).toHaveClass('lp-rv-in');
    expect(second).not.toHaveClass('lp-rv-in');
    advance(80);
    expect(second).toHaveClass('lp-rv-in');
  });

  it('shows the hero and closing headlines without highlights', () => {
    renderPage();
    expect(document.querySelector('.lp-hl-mark')).toBeNull();
    expect(document.querySelector('.lp-protect-cta h2')).toHaveTextContent(
      'Protect your piece of the pie and your peace of mind.',
    );
  });
});
