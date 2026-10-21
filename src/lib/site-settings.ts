/**
 * Private, code-configurable site behaviour. There is intentionally no settings
 * screen or menu entry for these values. Change them here to tune the site.
 */
export const SITE_SETTINGS = {
  toggleMarquee: true,
  smoothScrolling: true,
  scrollVelocity: 0.1, // Lenis lerp: lower = smoother/slower catch-up
  scrollDuration: 1.2, // Lenis duration in seconds
  customScrollbar: true,
} as const;
