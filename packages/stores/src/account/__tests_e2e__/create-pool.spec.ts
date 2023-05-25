/* eslint-disable */
import {
  chainId,
  deepContained,
  getEventFromTx,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";

describe("Create Pool Tx", () => {
  const { accountStore } = new RootStore();

  beforeAll(async () => {
    const account = accountStore.getAccount(chainId);
    account.cosmos.broadcastMode = "block";
    await waitAccountLoaded(account);
  });

  test("should fail with 0 assets", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      account.osmosis.sendCreateBalancerPoolMsg("0", [])
    ).rejects.not.toBeNull();
  });

  test("should fail with 1 assets", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      account.osmosis.sendCreateBalancerPoolMsg("0", [
        {
          weight: "100",
          token: {
            currency: {
              coinDenom: "OSMO",
              coinMinimalDenom: "uosmo",
              coinDecimals: 6,
            },
            amount: "100",
          },
        },
      ])
    ).rejects.not.toBeNull();
  });

  test("should fail with duplicated assets", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      account.osmosis.sendCreateBalancerPoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
        ],
        "",
        (_) => {}
      )
    ).rejects.not.toBeNull();
  });

  test("with 0 swap fee", async () => {
    const account = accountStore.getAccount(chainId);

    const tx = await new Promise<any>((resolve) => {
      account.osmosis.sendCreateBalancerPoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ION",
                coinMinimalDenom: "uion",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
        ],
        "",
        (tx) => {
          resolve(tx);
        }
      );
    });

    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value:
              "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    deepContained(
      {
        type: "transfer",
        attributes: [{ key: "amount", value: "100000000uion,100000000uosmo" }],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("with swap fee", async () => {
    const account = accountStore.getAccount(chainId);

    const tx = await new Promise<any>((resolve) => {
      account.osmosis.sendCreateBalancerPoolMsg(
        "0.1",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ION",
                coinMinimalDenom: "uion",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
        ],
        "",
        (tx) => {
          resolve(tx);
        }
      );
    });

    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value:
              "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    deepContained(
      {
        type: "transfer",
        attributes: [{ key: "amount", value: "100000000uion,100000000uosmo" }],
      },
      getEventFromTx(tx, "transfer")
    );
  });
});
