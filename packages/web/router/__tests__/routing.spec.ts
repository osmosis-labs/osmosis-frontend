/**
 * @jest-environment node
 */
import {
  BUCKET_COOKIE,
  decideBackend,
  hashBucket,
  isBuildAsset,
  OVERRIDE_COOKIE,
  parsePercent,
} from "../routing";

const PAGE = "https://app.test/pools";
const BROWSER = "Mozilla/5.0 (Macintosh) Safari/605.1.15";

function request(
  url = PAGE,
  {
    cookie,
    userAgent = BROWSER,
    ip = "203.0.113.7",
    dest = "document",
    method = "GET",
  }: {
    cookie?: string;
    userAgent?: string;
    ip?: string;
    dest?: string;
    method?: string;
  } = {}
) {
  const headers = new Headers({
    "user-agent": userAgent,
    "cf-connecting-ip": ip,
    "sec-fetch-dest": dest,
  });
  if (cookie) headers.set("cookie", cookie);
  return new Request(url, { method, headers });
}

describe("decideBackend", () => {
  it("sends a bucket below the percentage to Cloudflare and the rest to Vercel", () => {
    expect(
      decideBackend(request(PAGE, { cookie: `${BUCKET_COOKIE}=499` }), 5)
        .backend
    ).toBe("cf");
    expect(
      decideBackend(request(PAGE, { cookie: `${BUCKET_COOKIE}=500` }), 5)
        .backend
    ).toBe("vercel");
  });

  it("routes nothing to Cloudflare at 0% and everything at 100%", () => {
    const low = request(PAGE, { cookie: `${BUCKET_COOKIE}=0` });
    const high = request(PAGE, { cookie: `${BUCKET_COOKIE}=9999` });

    expect(decideBackend(low, 0).backend).toBe("vercel");
    expect(decideBackend(high, 100).backend).toBe("cf");
  });

  it("only moves browsers at the margin when the percentage changes", () => {
    const buckets = Array.from({ length: 10_000 }, (_, bucket) =>
      request(PAGE, { cookie: `${BUCKET_COOKIE}=${bucket}` })
    );
    const onCf = (percent: number) =>
      buckets.filter((r) => decideBackend(r, percent).backend === "cf");

    expect(onCf(1)).toHaveLength(100);
    expect(onCf(5)).toHaveLength(500);
    // Everyone on Cloudflare at 1% stays there at 5%.
    expect(onCf(5)).toEqual(expect.arrayContaining(onCf(1)));
  });

  it("assigns a cookie-less page load from its IP and user agent and pins it", () => {
    const first = decideBackend(request(), 50);
    const again = decideBackend(request(), 50);

    expect(again.backend).toBe(first.backend);
    const bucket = hashBucket(`203.0.113.7|${BROWSER}`);
    expect(first.setCookies).toEqual([
      expect.stringContaining(`${BUCKET_COOKIE}=${bucket};`),
    ]);
    expect(first.setCookies[0]).toContain("Max-Age=2592000");
  });

  it("keeps a page's cookie-less subresources on the same platform without setting cookies", () => {
    const page = decideBackend(request(), 50);
    const chunk = decideBackend(
      request("https://app.test/_next/static/chunks/main.js", {
        dest: "script",
      }),
      50
    );

    expect(chunk.backend).toBe(page.backend);
    expect(chunk.setCookies).toEqual([]);
  });

  it("prefers the bucket cookie over the IP hash", () => {
    const pinned = decideBackend(
      request(PAGE, { cookie: `${BUCKET_COOKIE}=0`, ip: "198.51.100.1" }),
      1
    );

    expect(pinned).toEqual({ backend: "cf", setCookies: [] });
  });

  it.each(["abc", "-1", "10000", ""])(
    "re-buckets an invalid bucket cookie %p",
    (value) => {
      const decision = decideBackend(
        request(PAGE, { cookie: `${BUCKET_COOKIE}=${value}` }),
        5
      );
      expect(decision.setCookies).toHaveLength(1);
    }
  );

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 Chrome-Lighthouse",
  ])("keeps crawler %p on Vercel", (userAgent) => {
    const decision = decideBackend(
      request(PAGE, { userAgent, cookie: `${BUCKET_COOKIE}=0` }),
      100
    );
    expect(decision.backend).toBe("vercel");
  });

  describe("QA override", () => {
    it("pins the session to a platform from the query string", () => {
      const decision = decideBackend(
        request(`${PAGE}?osmo_backend=cf`, { cookie: `${BUCKET_COOKIE}=9999` }),
        0
      );

      expect(decision.backend).toBe("cf");
      expect(decision.setCookies).toEqual([
        `${OVERRIDE_COOKIE}=cf; Path=/; Secure; SameSite=Lax`,
      ]);
    });

    it("keeps following the override cookie, even at 0%", () => {
      expect(
        decideBackend(request(PAGE, { cookie: `${OVERRIDE_COOKIE}=cf` }), 0)
          .backend
      ).toBe("cf");
      expect(
        decideBackend(
          request(PAGE, {
            cookie: `${OVERRIDE_COOKIE}=vercel; ${BUCKET_COOKIE}=0`,
          }),
          100
        ).backend
      ).toBe("vercel");
    });

    it("clears the override with auto", () => {
      const decision = decideBackend(
        request(`${PAGE}?osmo_backend=auto`, {
          cookie: `${OVERRIDE_COOKIE}=cf; ${BUCKET_COOKIE}=9999`,
        }),
        5
      );

      expect(decision.backend).toBe("vercel");
      expect(decision.setCookies).toContain(
        `${OVERRIDE_COOKIE}=; Path=/; Secure; SameSite=Lax; Max-Age=0`
      );
    });

    it("ignores unknown override values", () => {
      expect(
        decideBackend(
          request(`${PAGE}?osmo_backend=elsewhere`, {
            cookie: `${BUCKET_COOKIE}=9999`,
          }),
          5
        ).backend
      ).toBe("vercel");
    });
  });
});

describe("parsePercent", () => {
  it.each<[string | undefined, number]>([
    ["5", 5],
    ["0.5", 0.5],
    ["150", 100],
    ["-3", 0],
    ["abc", 0],
    ["", 0],
    [undefined, 0],
  ])("parses %p as %p", (value, expected) => {
    expect(parsePercent(value)).toBe(expected);
  });
});

describe("isBuildAsset", () => {
  it.each<[string, string, boolean]>([
    ["GET", "https://app.test/_next/static/chunks/main-abc.js", true],
    ["HEAD", "https://app.test/_next/static/css/app.css", true],
    ["POST", "https://app.test/_next/static/chunks/main-abc.js", false],
    ["GET", "https://app.test/_next/image?url=x", false],
    ["GET", "https://app.test/api/pools", false],
  ])("%s %s → %p", (method, url, expected) => {
    expect(isBuildAsset(new Request(url, { method }))).toBe(expected);
  });
});
