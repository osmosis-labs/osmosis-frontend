import type { AxiosInstance } from "axios";

import { authAccountFixtures } from "./__fixtures__/auth-accounts";
import { BaseAccount, ChainIdHelper } from "./cosmos";

describe("BaseAccount.fromProtoJSON", () => {
  it.each(authAccountFixtures)(
    "$name",
    ({ response, defaultAddress, expected }) => {
      const parse = () => BaseAccount.fromProtoJSON(response, defaultAddress);

      if (expected === "throws") {
        expect(parse).toThrow();
        return;
      }

      const account = parse();
      expect({
        type: account.getType(),
        address: account.getAddress(),
        accountNumber: account.getAccountNumber().toString(),
        sequence: account.getSequence().toString(),
      }).toEqual(expected);
    }
  );
});

describe("BaseAccount.fetchFromRest", () => {
  function mockInstance(status: number, data: unknown) {
    const get = jest.fn(
      async (
        _url: string,
        config: { validateStatus: (s: number) => boolean }
      ) => {
        if (!config.validateStatus(status)) {
          throw new Error(`Request failed with status code ${status}`);
        }
        return { status, data };
      }
    );
    return { instance: { get } as unknown as AxiosInstance, get };
  }

  it("queries the auth account endpoint and parses the account", async () => {
    const { instance, get } = mockInstance(
      200,
      authAccountFixtures[0].response
    );

    const account = await BaseAccount.fetchFromRest(instance, "osmo1base");

    expect(get.mock.calls[0][0]).toBe(
      "/cosmos/auth/v1beta1/accounts/osmo1base"
    );
    expect(account.getAccountNumber().toString()).toBe("123");
    expect(account.getSequence().toString()).toBe("45");
  });

  it("treats a 404 as a new account when defaultBech32Address is set", async () => {
    const { instance } = mockInstance(404, { code: 5, message: "not found" });

    const account = await BaseAccount.fetchFromRest(instance, "osmo1new", true);

    expect(account.getAddress()).toBe("osmo1new");
    expect(account.getAccountNumber().toString()).toBe("0");
    expect(account.getSequence().toString()).toBe("0");
  });

  it("throws on a 404 when defaultBech32Address is not set", async () => {
    const { instance } = mockInstance(404, { code: 5, message: "not found" });

    await expect(
      BaseAccount.fetchFromRest(instance, "osmo1new")
    ).rejects.toThrow("Account's address is unknown");
  });

  it("rejects other error statuses", async () => {
    const { instance } = mockInstance(500, {});

    await expect(
      BaseAccount.fetchFromRest(instance, "osmo1base", true)
    ).rejects.toThrow("500");
  });
});

describe("ChainIdHelper", () => {
  it.each([
    ["osmosis-1", { identifier: "osmosis", version: 1 }],
    ["cosmoshub-4", { identifier: "cosmoshub", version: 4 }],
    ["osmo-test-5", { identifier: "osmo-test", version: 5 }],
    ["evmos_9001-2", { identifier: "evmos_9001", version: 2 }],
    ["noversion", { identifier: "noversion", version: 0 }],
  ])("parses %s", (chainId, expected) => {
    expect(ChainIdHelper.parse(chainId)).toEqual(expected);
    expect(ChainIdHelper.hasChainVersion(chainId)).toBe(expected.version !== 0);
  });
});
