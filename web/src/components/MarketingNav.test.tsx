import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import MarketingNav, { HOW_IT_WORKS_ID } from './MarketingNav.tsx';

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

  it('closes the phone menu and goes to the dashboard from its Get started button', () => {
    const { container } = renderNav('/pricing');
    const nav = container.querySelector('nav')!;
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const menuCta = container.querySelector('#lp-nav-menu .lp-nav-cta')!;
    fireEvent.click(menuCta);
    expect(nav).not.toHaveClass('open');
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
  });

  it('opens and closes the phone menu, and closes it after "How it works"', () => {
    const { container } = renderNav('/pricing');
    const nav = container.querySelector('nav')!;
    expect(nav).not.toHaveClass('open');

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(nav).toHaveClass('open');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'How it works' }));
    expect(nav).not.toHaveClass('open');
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
