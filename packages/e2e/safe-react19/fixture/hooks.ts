// Only translations and the initialized TradingView flag are deterministic.
// Wallet adapters, signers, and live application providers are never imported.
export type PriceRange = "1h" | "1d" | "7d" | "1mo" | "1y" | "all";
export const useTranslation = () => ({
  t: (key: string, _params?: unknown) => key,
});
export const useFeatureFlags = () => ({ _isInitialized: true });
