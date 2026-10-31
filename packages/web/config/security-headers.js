// @ts-check

/**
 * Security headers for every response, applied from `headers()` in
 * `next.config.js`, so the Vercel and OpenNext (Cloudflare Workers) builds
 * serve the same policy.
 *
 * The CSP is a static header: pages use the pages router with ISR and have no
 * first-party inline scripts (`__NEXT_DATA__` is JSON), so there are no nonces.
 *
 * `connect-src`, `img-src` and `media-src` allow any `https:` origin. The
 * browser falls back across every chain-list RPC/REST endpoint (thousands of
 * hosts), so an allowlist isn't practical until chain endpoints are proxied.
 * Allowing images from any HTTPS host while `connect-src` does would add no
 * protection, so those stay open together. The policy still blocks plaintext
 * `http:` and `ws:` connections, external scripts, plugins and unlisted frames.
 */

/** `CSP_MODE` values:
 * - `report-only` (default): the full policy is sent as
 *   `Content-Security-Policy-Report-Only`. Only the directives a report-only
 *   header can't carry (`frame-ancestors`) and those nothing here relies on
 *   (`object-src`, `base-uri`) are enforced.
 * - `enforce`: the full policy is enforced.
 * - `off`: no CSP header at all, as a fallback if a policy breaks a provider.
 * Headers are fixed at build time, so a change takes a redeploy. */
const CSP_MODES = ["report-only", "enforce", "off"];

/** Violation reports are sent here (`report-uri` for Firefox and Safari, the
 *  `csp` Reporting API endpoint for Chromium). */
const CSP_REPORT_PATH = "/api/csp-report";

/** Origins allowed to embed the app. The wallet runtime accepts DAODAO as an
 *  iframe parent (`stores/wallet-runtime.ts`). `X-Frame-Options` can't express
 *  an allowlist, so it isn't sent. */
const FRAME_ANCESTORS = [
  "'self'",
  "https://daodao.zone",
  "https://dao.daodao.zone",
];

/** The fiat on-ramp widget, whose iframe is delegated camera, geolocation and
 *  payment (`integrations/swapped`). */
const SWAPPED_WIDGET_ORIGIN = "https://widget.swapped.com";

/**
 * @param {{ isDev: boolean, allowEval: boolean }} options `isDev` is
 *  `next dev`: React Refresh needs `eval`, and Vercel Speed Insights loads its
 *  debug script from Vercel's CDN. `allowEval` is for pages whose third-party
 *  code evaluates strings (Wormhole Connect on /wormhole).
 * @returns {Record<string, string[]>}
 */
function cspDirectives({ isDev, allowEval }) {
  return {
    "default-src": ["'self'"],
    "script-src": [
      // Includes /tradingview/ and /_vercel/speed-insights/.
      "'self'",
      // Nomic, Wormhole and the Solana/Sui SDKs instantiate WebAssembly.
      "'wasm-unsafe-eval'",
      // Wormhole Connect (pages/wormhole.tsx, SRI-pinned).
      "https://www.unpkg.com",
      // Cloudflare Web Analytics, which the osmosis.zone zone injects.
      "https://static.cloudflareinsights.com",
      ...(isDev || allowEval ? ["'unsafe-eval'"] : []),
      ...(isDev ? ["https://va.vercel-scripts.com"] : []),
    ],
    "style-src": [
      // Styled and animation libraries set inline styles.
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://www.unpkg.com",
    ],
    "font-src": [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
      "https://fonts.reown.com",
    ],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "media-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": ["'self'", "https:", "wss:"],
    "frame-src": [
      // TradingView charts.
      "'self'",
      "https://onramp.money",
      SWAPPED_WIDGET_ORIGIN,
      // WalletConnect / Reown verify and secure-site frames.
      "https://verify.walletconnect.com",
      "https://verify.walletconnect.org",
      "https://secure.walletconnect.com",
      "https://secure.walletconnect.org",
    ],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": FRAME_ANCESTORS,
    "report-uri": [CSP_REPORT_PATH],
    "report-to": ["csp"],
  };
}

/** @param {Record<string, string[]>} directives */
function serializeCsp(directives) {
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");
}

/** The directives enforced while the full policy is report-only, with the
 *  reporting directives so their violations are reported too. */
const ALWAYS_ENFORCED = [
  "frame-ancestors",
  "object-src",
  "base-uri",
  "report-uri",
  "report-to",
];

/**
 * @param {{ mode?: string, isDev: boolean, allowEval?: boolean }} options
 * @returns {{ key: string, value: string }[]}
 */
function securityHeaders({ mode = "report-only", isDev, allowEval = false }) {
  if (!CSP_MODES.includes(mode)) {
    throw new Error(
      `CSP_MODE must be one of ${CSP_MODES.join(", ")}, got "${mode}"`
    );
  }

  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: [
        `camera=(self "${SWAPPED_WIDGET_ORIGIN}")`,
        "microphone=()",
        `geolocation=(self "${SWAPPED_WIDGET_ORIGIN}")`,
        `payment=(self "${SWAPPED_WIDGET_ORIGIN}")`,
      ].join(", "),
    },
  ];

  if (mode === "off") return headers;

  const directives = cspDirectives({ isDev, allowEval });
  headers.push({
    key: "Reporting-Endpoints",
    value: `csp="${CSP_REPORT_PATH}"`,
  });

  if (mode === "enforce") {
    headers.push({
      key: "Content-Security-Policy",
      value: serializeCsp(directives),
    });
    return headers;
  }

  headers.push(
    {
      key: "Content-Security-Policy",
      value: serializeCsp(
        Object.fromEntries(
          ALWAYS_ENFORCED.map((name) => [name, directives[name]])
        )
      ),
    },
    {
      key: "Content-Security-Policy-Report-Only",
      value: serializeCsp(directives),
    }
  );
  return headers;
}

module.exports = { securityHeaders };
