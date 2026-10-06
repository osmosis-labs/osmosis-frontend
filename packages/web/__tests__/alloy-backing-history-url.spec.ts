import { getAlloyBackingHistoryUrl } from "~/components/alloyed-assets";
import { ALLOYED_ASSETS_DASHBOARD_URL } from "~/config/env";

const ALL_BTC_DENOM =
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC";

describe("getAlloyBackingHistoryUrl", () => {
  it("encodes a factory denom into a single path segment under the dashboard URL", () => {
    const url = getAlloyBackingHistoryUrl(ALL_BTC_DENOM);

    expect(url).toBe(
      `${ALLOYED_ASSETS_DASHBOARD_URL}/alloys/${encodeURIComponent(
        ALL_BTC_DENOM
      )}`
    );
    expect(url.startsWith(`${ALLOYED_ASSETS_DASHBOARD_URL}/alloys/`)).toBe(
      true
    );

    // The denom's own slashes are escaped, so the path has exactly one segment
    // after `/alloys/`.
    const segment = url.slice(`${ALLOYED_ASSETS_DASHBOARD_URL}/alloys/`.length);
    expect(segment).not.toContain("/");
    expect(segment).toBe(
      "factory%2Fosmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3%2Falloyed%2FallBTC"
    );
  });

  it("round-trips the denom through the URL", () => {
    const url = new URL(getAlloyBackingHistoryUrl(ALL_BTC_DENOM));
    const [, , encoded] = url.pathname.split("/");

    expect(url.origin).toBe(new URL(ALLOYED_ASSETS_DASHBOARD_URL).origin);
    expect(decodeURIComponent(encoded)).toBe(ALL_BTC_DENOM);
  });

  it("leaves a plain native denom unchanged", () => {
    expect(getAlloyBackingHistoryUrl("uosmo")).toBe(
      `${ALLOYED_ASSETS_DASHBOARD_URL}/alloys/uosmo`
    );
  });
});
