/**
 * Opens the Tally contact form as a modal over the current page, without the form's own title
 * (no-op until the embed loads).
 */
export const openContactForm = () =>
  window.Tally?.openPopup('2EEB99', { layout: 'modal', width: 700, hideTitle: true });
