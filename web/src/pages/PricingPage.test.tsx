import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { breadcrumbs } from '../test/pageMeta.ts';
import PricingPage from './PricingPage.tsx';

// The marketing chrome has its own tests.
vi.mock('../components/MarketingNav', () => ({ default: () => <nav data-testid="nav" /> }));
vi.mock('../components/MarketingFooter', () => ({
  default: () => <footer data-testid="footer" />,
}));
vi.mock('../components/MarketingGrain', () => ({ default: () => <svg data-testid="grain" /> }));

/** jsdom has no IntersectionObserver; this one reveals what it observes on demand. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  constructor(
    private readonly callback: (entries: { isIntersecting: boolean; target: Element }[]) => void,
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
    this.callback(targets.map((target) => ({ isIntersecting: true, target })));
  }
}

function Location() {
  const { pathname } = useLocation();
  return <p data-testid="path">{pathname}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/pricing']}>
      <PricingPage />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

const path = () => screen.getByTestId('path').textContent;
const cards = () => Array.from(document.querySelectorAll<HTMLElement>('.lp-pw-card'));
const faqBody = (question: string) =>
  screen.getByRole('button', { name: question }).parentElement?.querySelector('.lp-faq-body');

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.useRealTimers();
  Reflect.deleteProperty(window, 'Tally');
});

describe('PricingPage', () => {
  it('sets the page meta and the FAQ JSON-LD, removed on unmount', () => {
    const { unmount } = renderPage();
    expect(document.title).toBe('Pricing — Cherrytree');
    expect(breadcrumbs()).toEqual(['Home', 'Pricing']);

    const faq = JSON.parse(document.getElementById('faq-schema')?.textContent ?? '') as {
      '@type': string;
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity.map((q) => q.name)).toEqual([
      'Which plan is right for me?',
      'Is the price per agreement or per person?',
      'Can we buy for a whole cohort or portfolio?',
      'Do we pay again to edit later?',
    ]);
    expect(faq.mainEntity[2]?.acceptedAnswer.text).toMatch(/volume pricing for every team/);

    unmount();
    expect(document.getElementById('faq-schema')).toBeNull();
  });

  it('renders the two plans with their prices, features and calls to action', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vest assured.');

    const [bootstrapped, scale] = cards();
    expect(cards()).toHaveLength(2);
    expect(bootstrapped?.querySelector('.lp-pw-tier')).toHaveTextContent('Standard');
    expect(bootstrapped?.querySelector('.lp-pw-price')).toHaveTextContent('$49one-time');
    expect(bootstrapped?.querySelectorAll('.lp-pw-features li')).toHaveLength(5);

    expect(scale?.querySelector('.lp-pw-price')).toHaveTextContent("Let's Talk");
    expect(scale?.querySelector('.lp-pw-features li')).toHaveTextContent(
      'Everything included in Standard',
    );

    expect(scale?.querySelector('.lp-pw-tier')).toHaveTextContent('Custom');
    expect(scale?.querySelector('.lp-pw-price > span')).toBeNull();
    expect(scale?.querySelector('button')).toHaveTextContent('Contact sales');

    expect(screen.getByTestId('grain')).toBeInTheDocument();
    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('sends every Get started to the dashboard and Contact sales to the Tally form', () => {
    const openPopup = vi.fn();
    window.Tally = { openPopup };
    renderPage();

    const [getStarted, bottomStarted] = screen.getAllByRole('button', { name: 'Get started' });
    expect(bottomStarted).toBeDefined();
    fireEvent.click(getStarted!);
    expect(path()).toBe('/dashboard');
    expect(openPopup).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Contact sales' }));
    expect(openPopup).toHaveBeenCalledTimes(1);
    expect(openPopup).toHaveBeenCalledWith('2EEB99', {
      layout: 'modal',
      width: 700,
      hideTitle: true,
    });
    expect(path()).toBe('/dashboard');
  });

  it('does nothing on Contact sales when the Tally embed has not loaded', () => {
    renderPage();
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Contact sales' })),
    ).not.toThrow();
    expect(path()).toBe('/pricing');
  });

  it('marks the compare table per plan', () => {
    renderPage();
    const rows = Array.from(document.querySelectorAll('.lp-ppt-row'));
    expect(rows).toHaveLength(11);
    expect(document.querySelectorAll('.lp-ppt-card')).toHaveLength(2);
    const marks = (column: number) =>
      rows.filter((row) => row.querySelectorAll('td')[column]?.textContent === '✓').length;
    expect(marks(1)).toBe(5); // Standard
    expect(marks(2)).toBe(8); // Custom

    const cells = (label: string) =>
      Array.from(
        rows
          .find((row) => row.querySelector('.lp-ppt-label')?.textContent === label)!
          .querySelectorAll('td'),
        (td) => td.textContent,
      );
    expect(cells('Price')).toEqual(['Price', '$49, one-time', 'Volume pricing']);
    expect(cells('Branded for your program')[1]).toContain('Not included');
  });

  it('opens an FAQ on click and closes it again', () => {
    renderPage();
    const question = 'Can we buy for a whole cohort or portfolio?';
    expect(faqBody(question)).not.toHaveClass('open');

    fireEvent.click(screen.getByRole('button', { name: question }));
    expect(faqBody(question)).toHaveClass('open');
    fireEvent.click(screen.getByRole('button', { name: question }));
    expect(faqBody(question)).not.toHaveClass('open');
  });

  it('shows the closing headline without a highlight', () => {
    renderPage();
    expect(document.querySelector('.lp-protect-cta .lp-hl-mark')).toBeNull();
    expect(document.querySelector('.lp-protect-cta h2')).toHaveTextContent(
      'Protect your piece of the pie and your peace of mind.',
    );
  });
});
