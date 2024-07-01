/* eslint-disable */
import { ObservableQueryPool } from "../../queries-external/pools";
import {
  RootStore,
  waitAccountLoaded,
  getLatestQueryPool,
  initAccount,
} from "../../tests/test-env";
import { TestOsmosisChainId } from "../../tests/mock-data";

describe("Exit Pool Tx", () => {
  let { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined; // relies on `jest --runInBand` to work properly

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
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
    queryPool = await getLatestQueryPool(TestOsmosisChainId, queriesStore);
  });

  test("should fail with 0 share in amount", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      account?.osmosis.sendExitPoolMsg(
        queryPool!.id,
        "0",
        queryPool!.sharePool!.totalShare,
        queryPool!.poolAssets.map((a) => a.amount.toCoin()),
        queryPool!.sharePool!.exitFee
      )
    ).rejects.not.toBeNull();
  });

  test("succeed with 50 share in amount without slippage", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(
            queryPool!.id,
            "50",
            queryPool!.sharePool!.totalShare,
            queryPool!.poolAssets.map((a) => a.amount.toCoin()),
            queryPool!.sharePool!.exitFee,
            "0",
            "",
            (tx) => {
              if (tx.code) rejects(tx);
              else resolve(tx);
            }
          )
          .catch((e) => rejects(e));
      })
    ).resolves.toBeDefined();
  });

  test("succeed with 50 share in amount with slippage", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(
            queryPool!.id,
            "50",
            queryPool!.sharePool!.totalShare,
            queryPool!.poolAssets.map((a) => a.amount.toCoin()),
            queryPool!.sharePool!.exitFee,
            "1",
            "",
            (tx) => {
              if (tx.code) rejects(tx);
              else resolve(tx);
            }
          )
          .catch((e) => rejects(e));
      })
    ).resolves.toBeDefined();
  });

  test("should fail with more max share in amount than in account", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise<any>((resolve, rejects) => {
        account?.osmosis
          .sendExitPoolMsg(
            queryPool!.id,
            "100.1",
            queryPool!.sharePool!.totalShare,
            queryPool!.poolAssets.map((a) => a.amount.toCoin()),
            queryPool!.sharePool!.exitFee,
            "",
            "",
            (tx) => {
              if (tx.code) rejects(tx);
              else resolve(tx);
            }
          )
          .catch((e) => rejects(e));
      })
    ).rejects.not.toBeNull();
  });
});
