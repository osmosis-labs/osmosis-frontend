/* eslint-disable */
import { TestOsmosisChainId } from "../../tests/mock-data";
import {
  deepContained,
  getEventFromTx,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../tests/test-env";

describe("Create Pool Tx", () => {
  const { accountStore } = new RootStore();

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  test("weighted - should fail with 0 assets", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      account!.osmosis.sendCreateBalancerPoolMsg("0", [])
    ).rejects.not.toBeNull();
  });

  test("weighted - should fail with 1 assets", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      account!.osmosis.sendCreateBalancerPoolMsg("0", [
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

  test("weighted - should fail with duplicated assets", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      account!.osmosis.sendCreateBalancerPoolMsg(
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

  test("weighted - with 0 swap fee", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tx = await new Promise<any>((resolve, reject) => {
      account!.osmosis.sendCreateBalancerPoolMsg(
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
          if (tx.code) reject(tx.rawLog);
          else resolve(tx);
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
            value: account!.address,
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

  test("weighted - with swap fee", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tx = await new Promise<any>((resolve, reject) => {
      account!.osmosis
        .sendCreateBalancerPoolMsg(
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
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject);
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
            value: account!.address,
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

  test("concentrated - base creation", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise<any>((resolve, reject) => {
        account!.osmosis
          .sendCreateConcentratedPoolMsg(
            "uion",
            "uosmo",
            1,
            0,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve(tx);
            }
          )
          .catch(reject);
      })
    ).resolves.toBeDefined();
  });
});
