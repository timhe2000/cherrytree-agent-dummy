import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ScenarioArc from './ScenarioArc.tsx';

// jsdom has no layout: record the scroll calls, and hold back the frame that would re-pick the
// centred card from all-zero positions.
let scrollTo: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  scrollTo = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => {});
  vi.stubGlobal('requestAnimationFrame', () => 0);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ScenarioArc', () => {
  it('shows a page per scenario, opening on Decisions', () => {
    render(<ScenarioArc />);
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual([
      'Who owns what?',
      'What if someone leaves early?',
      'Who gets the final say?',
      'Who owns the code?',
      'When do we get paid?',
      'What if someone checks out?',
    ]);
    expect(screen.getByRole('article', { name: 'Who gets the final say?' })).toHaveClass('active');
    expect(scrollTo).toHaveBeenCalledWith({ left: expect.any(Number), behavior: 'auto' });
  });

  it('brings a clicked card to the centre', () => {
    render(<ScenarioArc />);
    fireEvent.click(screen.getByRole('article', { name: 'When do we get paid?' }));
    expect(screen.getByRole('article', { name: 'When do we get paid?' })).toHaveClass('active');
    expect(screen.getByRole('article', { name: 'Who gets the final say?' })).not.toHaveClass(
      'active',
    );
    expect(scrollTo).toHaveBeenLastCalledWith({ left: expect.any(Number), behavior: 'smooth' });
  });
});
