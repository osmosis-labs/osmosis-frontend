/* eslint-disable */
import { ObservableQueryPool } from "../../queries";
import {
  chainId,
  RootStore,
  waitAccountLoaded,
  getLatestQueryPool,
} from "../../__tests_e2e__/test-env";

describe("Exit Pool Tx", () => {
  let { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined; // relies on `jest --runInBand` to work properly

  beforeEach(async () => {
    const account = accountStore.getWallet(chainId);
    await waitAccountLoaded(account);

    // And prepare the pool
    await account?.osmosis.sendCreateBalancerPoolMsg(
      "0",
      [
        {
          weight: "200",
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
          weight: "300",
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
      ""
    );

    // get latest pool
    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  test("should fail with 0 share in amount", async () => {
    const account = accountStore.getWallet(chainId);

    await expect(
      account?.osmosis.sendExitPoolMsg(queryPool!.id, "0")
    ).rejects.not.toBeNull();
  });

  test("succeed with 50 share in amount without slippage", async () => {
    const account = accountStore.getWallet(chainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(queryPool!.id, "50", "0", "", (tx) => {
            if (tx.code) rejects(tx);
            else resolve(tx);
          })
          .catch((e) => rejects(e));
      })
    ).resolves.toBeDefined();
  });

  test("succeed with 50 share in amount with slippage", async () => {
    const account = accountStore.getWallet(chainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(queryPool!.id, "50", "1", "", (tx) => {
            if (tx.code) rejects(tx);
            else resolve(tx);
          })
          .catch((e) => rejects(e));
      })
    ).resolves.toBeDefined();
  });

  test("should fail with more max share in amount than in account", async () => {
    const account = accountStore.getWallet(chainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(queryPool!.id, "100.1", "", "", (tx) => {
            if (tx.code) rejects(tx);
            else resolve(tx);
          })
          .catch((e) => rejects(e));
      })
    ).rejects.not.toBeNull();
  });
});
