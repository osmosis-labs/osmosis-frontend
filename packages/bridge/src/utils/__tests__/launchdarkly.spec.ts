import * as LaunchDarkly from "launchdarkly-node-client-sdk";

jest.mock("launchdarkly-node-client-sdk", () => ({ initialize: jest.fn() }));

const initialize = LaunchDarkly.initialize as jest.Mock;

/** The client is cached at module level, so each test loads a fresh copy. */
const loadModule = (): typeof import("../launchdarkly") => {
  let mod: typeof import("../launchdarkly");
  jest.isolateModules(() => {
    mod = require("../launchdarkly");
  });
  return mod!;
};

const mockClient = ({
  waitForInitialization = jest.fn().mockResolvedValue(undefined),
  variation = jest.fn().mockResolvedValue(true),
} = {}) => {
  const client = { waitForInitialization, variation };
  initialize.mockReturnValue(client);
  return client;
};

describe("getLaunchDarklyFlagValue", () => {
  beforeEach(() => {
    initialize.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the flag value and bounds initialization with a timeout", async () => {
    const client = mockClient();
    const { getLaunchDarklyFlagValue } = loadModule();

    await expect(
      getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
        defaultValue: false,
      })
    ).resolves.toBe(true);
    expect(client.waitForInitialization).toHaveBeenCalledWith(
      expect.any(Number)
    );
  });

  it("falls back to the client's default when initialization fails", async () => {
    // A failed client still serves variation(), returning the default it is given.
    const client = mockClient({
      waitForInitialization: jest
        .fn()
        .mockRejectedValue(new Error("No environment/client-side ID")),
      variation: jest.fn((_key, defaultValue) => Promise.resolve(defaultValue)),
    });
    const { getLaunchDarklyFlagValue } = loadModule();

    await expect(
      getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
        defaultValue: false,
      })
    ).resolves.toBe(false);
    expect(client.variation).toHaveBeenCalledWith(
      "nomic-withdraw-amount",
      false
    );
  });

  it("returns the default when flag evaluation throws", async () => {
    mockClient({
      variation: jest.fn().mockRejectedValue(new Error("network down")),
    });
    const { getLaunchDarklyFlagValue } = loadModule();

    await expect(
      getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
        defaultValue: false,
      })
    ).resolves.toBe(false);
  });

  it("returns the default when the client cannot be created", async () => {
    initialize.mockImplementation(() => {
      throw new Error("invalid context");
    });
    const { getLaunchDarklyFlagValue } = loadModule();

    await expect(
      getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
        defaultValue: false,
      })
    ).resolves.toBe(false);
  });

  it("shares one client across concurrent first calls", async () => {
    mockClient();
    const { getLaunchDarklyFlagValue } = loadModule();

    await Promise.all(
      Array.from({ length: 3 }, () =>
        getLaunchDarklyFlagValue({
          key: "nomicWithdrawAmount",
          defaultValue: false,
        })
      )
    );
    expect(initialize).toHaveBeenCalledTimes(1);
  });
});
