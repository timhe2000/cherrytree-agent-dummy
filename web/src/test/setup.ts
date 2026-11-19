import '@testing-library/jest-dom/vitest';

// jsdom lays nothing out, so it has no element scrolling; a no-op lets components that scroll a row
// render. Tests that care spy on it.
Element.prototype.scrollTo ??= () => {};
