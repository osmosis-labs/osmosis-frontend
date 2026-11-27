/** The TradingView loader script; it starts the library from `bundles/`. */
export const TRADING_VIEW_LOADER_SRC =
  "/tradingview/charting_library.standalone.js";

let started = false;

/**
 * Warms the browser cache with the TradingView loader and the bundles it
 * starts from (about 1MB compressed, most of it the library), so a chart
 * mounted soon after is drawn sooner. Runs once per page load.
 *
 * The bundle names carry content hashes, so they are read from the loader
 * rather than listed here, and stay right when the library is upgraded.
 */
export function prefetchTradingViewChart() {
  if (started || typeof document === "undefined") return;
  started = true;

  const prefetch = (href: string, as: "script" | "style") => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = as;
    link.href = href;
    document.head.appendChild(link);
  };

  fetch(TRADING_VIEW_LOADER_SRC)
    .then((response) => (response.ok ? response.text() : ""))
    .then((source) => {
      const bundles = new Set(source.match(/bundles\/[\w.-]+\.(?:js|css)/g));
      for (const bundle of bundles) {
        // The widget is created with locale "en".
        const path = bundle.replace("__LANG__", "en");
        prefetch(
          `/tradingview/${path}`,
          path.endsWith(".css") ? "style" : "script"
        );
      }
    })
    // Only a head start: the chart loads everything itself regardless.
    .catch(() => {});
}
