/**
 * The orderbook pools LRU is shared by every client of a server instance, and
 * a forced-fresh read (used right after orderbook creation) writes its result
 * back into it. These tests pin the TTL semantics of that write: a fresh read
 * that still captures the pre-creation list must expire quickly rather than
 * displace the shared cache for the full regular window.
 */

jest.mock("../../../sidecar/orderbooks", () => ({
  queryCanonicalOrderbooks: jest.fn(),
}));

let poolsModule: typeof import("../pools");
let sidecarModule: { queryCanonicalOrderbooks: jest.Mock };

const preCreationList = [
  {
    base: "uatom",
    quote: "uusdc",
    contract_address: "osmo1existing",
    pool_id: 1,
  },
];
const caughtUpList = [
  ...preCreationList,
  {
    base: "ujuno",
    quote: "uusdc",
    contract_address: "osmo1justmade",
    pool_id: 2,
  },
];

const contractAddresses = (pools: { contractAddress: string }[]) =>
  pools.map((pool) => pool.contractAddress);

beforeEach(() => {
  jest.useFakeTimers();
  // Isolate the module registry so each test gets its own LRU instance.
  jest.isolateModules(() => {
    /* eslint-disable @typescript-eslint/no-var-requires */
    poolsModule = require("../pools");
    sidecarModule = require("../../../sidecar/orderbooks");
    /* eslint-enable @typescript-eslint/no-var-requires */
  });
  sidecarModule.queryCanonicalOrderbooks.mockResolvedValue(preCreationList);
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("fetchOrderbookPools cache behavior", () => {
  it("serves regular reads from cache for the full window", async () => {
    await poolsModule.getOrderbookPools();
    sidecarModule.queryCanonicalOrderbooks.mockResolvedValue(caughtUpList);

    jest.advanceTimersByTime(16 * 1000);
    const withinWindow = await poolsModule.getOrderbookPools();
    expect(contractAddresses(withinWindow)).not.toContain("osmo1justmade");

    jest.advanceTimersByTime(61 * 60 * 1000);
    const afterWindow = await poolsModule.getOrderbookPools();
    expect(contractAddresses(afterWindow)).toContain("osmo1justmade");
  });

  it("bypasses a stale cached list on a forced-fresh read", async () => {
    await poolsModule.getOrderbookPools();
    sidecarModule.queryCanonicalOrderbooks.mockResolvedValue(caughtUpList);

    const fresh = await poolsModule.getOrderbookPoolsFresh();
    expect(contractAddresses(fresh)).toContain("osmo1justmade");
  });

  it("expires a still-stale forced-fresh capture quickly instead of re-poisoning the shared cache", async () => {
    // The sidecar hasn't ingested the new pool yet: the fresh read captures
    // the pre-creation list and writes it back.
    const fresh = await poolsModule.getOrderbookPoolsFresh();
    expect(contractAddresses(fresh)).not.toContain("osmo1justmade");

    // The sidecar catches up. Within the short TTL the stale capture still
    // serves...
    sidecarModule.queryCanonicalOrderbooks.mockResolvedValue(caughtUpList);
    jest.advanceTimersByTime(10 * 1000);
    const withinShortTtl = await poolsModule.getOrderbookPools();
    expect(contractAddresses(withinShortTtl)).not.toContain("osmo1justmade");

    // ...but a regular read shortly after expiry picks up the caught-up
    // list, rather than being stuck behind a full one-hour window.
    jest.advanceTimersByTime(6 * 1000);
    const afterShortTtl = await poolsModule.getOrderbookPools();
    expect(contractAddresses(afterShortTtl)).toContain("osmo1justmade");
  });

  it("re-seeds the shared cache when the forced-fresh read catches the new pool", async () => {
    sidecarModule.queryCanonicalOrderbooks.mockResolvedValue(caughtUpList);
    await poolsModule.getOrderbookPoolsFresh();

    // The regular read is served from the fresh capture without another
    // sidecar call.
    sidecarModule.queryCanonicalOrderbooks.mockClear();
    const cached = await poolsModule.getOrderbookPools();
    expect(contractAddresses(cached)).toContain("osmo1justmade");
    expect(sidecarModule.queryCanonicalOrderbooks).not.toHaveBeenCalled();
  });
});
