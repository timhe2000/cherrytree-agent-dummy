import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import MarketingNav, { HOW_IT_WORKS_ID, MENU_CLOSE_MS } from './MarketingNav.tsx';

function Location() {
  const { pathname, hash } = useLocation();
  return (
    <>
      <p data-testid="path">{pathname}</p>
      <p data-testid="hash">{hash}</p>
    </>
  );
}

function renderNav(entry = '/') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <MarketingNav />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MarketingNav', () => {
  it('routes the logo, sign-in and CTA through the router', () => {
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/login');
    // The bar's button; the menu's own copy comes first in the DOM.
    fireEvent.click(screen.getAllByRole('button', { name: 'Get started' })[1]!);
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
    fireEvent.click(screen.getByRole('button', { name: /Cherrytree/ }));
    expect(screen.getByTestId('path')).toHaveTextContent('/');
  });

  describe('phone menu', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    // Closing animates out first: the menu stays up, marked closing, then goes.
    const expectClosesAnimated = (nav: HTMLElement) => {
      expect(nav).toHaveClass('open', 'closing');
      act(() => vi.advanceTimersByTime(MENU_CLOSE_MS));
      expect(nav).not.toHaveClass('open');
      expect(nav).not.toHaveClass('closing');
    };

    it('closes and goes to the dashboard from its Get started button', () => {
      const { container } = renderNav('/pricing');
      const nav = container.querySelector('nav')!;
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
      fireEvent.click(container.querySelector('#lp-nav-menu .lp-nav-cta')!);
      expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
      expectClosesAnimated(nav);
    });

    it('opens, and closes with its animation from the toggle and after "How it works"', () => {
      const { container } = renderNav('/pricing');
      const nav = container.querySelector('nav')!;
      expect(nav).not.toHaveClass('open');

      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
      expect(nav).toHaveClass('open');
      expect(nav).not.toHaveClass('closing');
      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expectClosesAnimated(nav);

      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
      fireEvent.click(screen.getByRole('button', { name: 'How it works' }));
      expectClosesAnimated(nav);
    });

    it('reopens straight away when tapped again mid-close', () => {
      const { container } = renderNav('/pricing');
      const nav = container.querySelector('nav')!;
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
      fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
      act(() => vi.advanceTimersByTime(MENU_CLOSE_MS));
      expect(nav).toHaveClass('open');
      expect(nav).not.toHaveClass('closing');
    });
  });

  describe('How it works', () => {
    it('scrolls to the section when already on the landing page', () => {
      const section = document.createElement('section');
      section.id = HOW_IT_WORKS_ID;
      const scrollIntoView = vi.fn();
      section.scrollIntoView = scrollIntoView;
      document.body.appendChild(section);

      renderNav();
      fireEvent.click(screen.getByRole('button', { name: 'How it works' }));

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      expect(screen.getByTestId('path')).toHaveTextContent('/');
      section.remove();
    });

    it('routes to the landing page with the section hash from another page', () => {
      renderNav('/pricing');
      fireEvent.click(screen.getByRole('button', { name: 'How it works' }));
      expect(screen.getByTestId('path')).toHaveTextContent('/');
      expect(screen.getByTestId('hash')).toHaveTextContent(`#${HOW_IT_WORKS_ID}`);
    });
  });
});
