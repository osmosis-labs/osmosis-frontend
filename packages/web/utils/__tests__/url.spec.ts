import { findAllowedRestEndpoint, normalizeRestBaseUrl } from "~/utils/url";

const lcdOsmosis = "https://lcd.osmosis.zone";
const cosmosDirectoryOsmosis = "https://rest.cosmos.directory/osmosis";

describe("normalizeRestBaseUrl", () => {
  it("normalizes a standard REST endpoint", () => {
    expect(normalizeRestBaseUrl("https://fake-endpoint.com")).toBe(
      "https://fake-endpoint.com"
    );
  });

  it("strips trailing slash from pathname", () => {
    expect(normalizeRestBaseUrl("https://fake-endpoint.com/")).toBe(
      "https://fake-endpoint.com"
    );
  });

  it("preserves path-prefixed REST endpoints", () => {
    expect(normalizeRestBaseUrl(cosmosDirectoryOsmosis)).toBe(
      cosmosDirectoryOsmosis
    );
  });

  it("rejects empty strings", () => {
    expect(() => normalizeRestBaseUrl("")).toThrow();
  });

  it("rejects incomplete URLs", () => {
    expect(() => normalizeRestBaseUrl("https://")).toThrow();
  });

  it("rejects URLs with credentials", () => {
    expect(() =>
      normalizeRestBaseUrl("https://user:pass@lcd.osmosis.zone")
    ).toThrow();
  });

  it("rejects URLs with query or hash", () => {
    expect(() =>
      normalizeRestBaseUrl("https://lcd.osmosis.zone?foo=bar")
    ).toThrow();
    expect(() =>
      normalizeRestBaseUrl("https://lcd.osmosis.zone#fragment")
    ).toThrow();
  });
});

describe("findAllowedRestEndpoint", () => {
  const allowed = [lcdOsmosis, cosmosDirectoryOsmosis];

  it("matches an exact allowlisted endpoint", () => {
    expect(findAllowedRestEndpoint("https://fake-endpoint.com", allowed)).toBe(
      null
    );
    expect(
      findAllowedRestEndpoint("https://fake-endpoint.com", [
        "https://fake-endpoint.com",
      ])
    ).toBe("https://fake-endpoint.com");
  });

  it("matches trailing-slash variants", () => {
    expect(
      findAllowedRestEndpoint("https://fake-endpoint.com/", [
        "https://fake-endpoint.com",
      ])
    ).toBe("https://fake-endpoint.com");
  });

  it("returns the canonical allowlist value on match", () => {
    const allowlisted = "https://FAKE-ENDPOINT.COM/";
    expect(
      findAllowedRestEndpoint("https://fake-endpoint.com", [allowlisted])
    ).toBe(normalizeRestBaseUrl(allowlisted));
  });

  it("matches path-prefixed endpoints", () => {
    expect(findAllowedRestEndpoint(cosmosDirectoryOsmosis, allowed)).toBe(
      cosmosDirectoryOsmosis
    );
  });

  it("rejects empty strings", () => {
    expect(findAllowedRestEndpoint("", allowed)).toBe(null);
  });

  it("rejects URL prefixes", () => {
    expect(findAllowedRestEndpoint("https://", allowed)).toBe(null);
    expect(findAllowedRestEndpoint("https://l", allowed)).toBe(null);
  });

  it("rejects subdomain suffix bypasses", () => {
    expect(
      findAllowedRestEndpoint("https://lcd.osmosis.zone.evil.com", allowed)
    ).toBe(null);
  });

  it("rejects partial path matches", () => {
    expect(
      findAllowedRestEndpoint("https://rest.cosmos.directory", allowed)
    ).toBe(null);
  });
});
