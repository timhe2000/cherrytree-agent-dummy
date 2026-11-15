import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { breadcrumbs } from '../test/pageMeta.ts';
import AboutPage from './AboutPage.tsx';

// The marketing chrome has its own tests.
vi.mock('../components/MarketingNav', () => ({ default: () => <nav data-testid="nav" /> }));
vi.mock('../components/MarketingFooter', () => ({
  default: () => <footer data-testid="footer" />,
}));
vi.mock('../components/MarketingGrain', () => ({ default: () => <svg data-testid="grain" /> }));
// The closing CTA has its own coverage in the landing and pricing tests.
vi.mock('../components/ProtectCta', () => ({
  default: ({ onStart }: { onStart: () => void }) => <button onClick={onStart}>Get started</button>,
}));

function Location() {
  const { pathname } = useLocation();
  return <p data-testid="path">{pathname}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/about']}>
      <AboutPage />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AboutPage', () => {
  it('sets the page meta', () => {
    renderPage();
    expect(document.title).toBe('About Cherrytree — Fair Cofounder Agreements for Startups');
    expect(breadcrumbs()).toEqual(['Home', 'About']);
  });

  it('renders the hero and painting inside the marketing chrome', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('We’re in good company.');
    expect(
      screen.getByRole('img', { name: 'Painting of a cherry tree in a blossoming valley' }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('grain')).toBeInTheDocument();
    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('ends with the Get started CTA, which goes to the dashboard', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/dashboard');
  });

  it('sends Contact us to the contact page', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Contact us' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/contact');
  });
});
