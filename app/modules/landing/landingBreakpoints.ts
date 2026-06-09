/** Shared breakpoints for landing page responsive layout (web). */
export const LANDING_MOBILE_MAX = 767;
export const LANDING_TABLET_MAX = 1049;

export function isLandingMobile(width: number): boolean {
  return width <= LANDING_MOBILE_MAX;
}

export function isLandingTablet(width: number): boolean {
  return width > LANDING_MOBILE_MAX && width <= LANDING_TABLET_MAX;
}

export function landingHorizontalPadding(width: number): number {
  return isLandingMobile(width) ? 20 : 32;
}
