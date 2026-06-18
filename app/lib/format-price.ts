/**
 * Shared price formatting for listings.
 *
 * Price is optional: when a listing has no price set the broker wants the public
 * site to invite an inquiry instead of showing ₱0. Use {@link PRICE_ON_REQUEST}
 * as the single source of truth for that label.
 */

export const PRICE_ON_REQUEST = "Price on Request";

/** True only when a usable, positive price is present. */
export function hasPrice(price?: number | null): price is number {
  return price != null && Number.isFinite(Number(price)) && Number(price) > 0;
}

interface FormatPriceOptions {
  /** Abbreviate large amounts (₱1.5M, ₱950K). Defaults to full amount. */
  compact?: boolean;
}

/**
 * Formats a listing price, returning {@link PRICE_ON_REQUEST} when no price is set.
 */
export function formatPrice(price?: number | null, opts: FormatPriceOptions = {}): string {
  if (!hasPrice(price)) return PRICE_ON_REQUEST;

  const value = Number(price);
  if (opts.compact) {
    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`;
  }
  return `₱${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
