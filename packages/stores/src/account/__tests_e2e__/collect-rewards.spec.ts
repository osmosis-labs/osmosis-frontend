/* eslint-disable */
import { ObservableQueryPool } from "../../queries-external/pools";
import {
  getLatestQueryPool,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../tests/test-env";
import { maxTick, minTick } from "@osmosis-labs/math";
import { TestOsmosisChainId } from "../../tests/mock-data";

describe("Collect Cl Fees Txs", () => {
  const { accountStore, queriesStore, chainStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    // prepare CL pool
    await new Promise<void>((resolve, reject) => {
      account!.osmosis
        .sendCreateConcentratedPoolMsg(
          "uion",
          "uosmo",
          1,
          0.001, // must have spread factor to generate fees
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve();
          }
        )
        .catch(reject);
    });

    queryPool = await getLatestQueryPool(TestOsmosisChainId, queriesStore);
  });

  it("should collect fees", async () => {
    // note: must swap twice in pool to incur fees
    await swapInPool(queryPool!.id);
    await swapInPool(queryPool!.id);

    const account = accountStore.getWallet(TestOsmosisChainId);
    const userPositionIds = await getUserPositionsIds();
    await expect(
      new Promise((resolve, reject) =>
        account!.osmosis
          .sendCollectAllPositionsRewardsMsgs(
            userPositionIds,
            userPositionIds,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve(tx);
            }
          )
          .catch(reject)
      )
    ).resolves.toBeDefined(); // resolve to successful tx obj
  });

  it("should reject if no fees to collect", async () => {
    // DONT swap in pools
    // await swapInPool(queryPool!.id);

    const account = accountStore.getWallet(TestOsmosisChainId);
    const userPositionIds = await getUserPositionsIds();
    await expect(
      new Promise((resolve, reject) =>
        account!.osmosis
          .sendCollectAllPositionsRewardsMsgs(
            userPositionIds,
            userPositionIds,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve(tx);
            }
          )
          .catch(reject)
      )
    ).rejects.toBeDefined();
  });

  // TODO setup test with incentive rewards once we add incentive creation txs

  async function swapInPool(poolId: string) {
    const account = accountStore.getWallet(TestOsmosisChainId);
    if (!account) throw new Error();

    const osmoCurrency = chainStore
      .getChain(TestOsmosisChainId)
      .forceFindCurrency("uosmo");
    const osmoSwapAmount = "10";

    const ionCurrency = chainStore
      .getChain(TestOsmosisChainId)
      .forceFindCurrency("uion");
    const ionSwapAmount = "10";

    // prepare CL position
    await new Promise<void>((resolve, reject) => {
      account.osmosis
        .sendCreateConcentratedLiquidityPositionMsg(
          poolId,
          minTick,
          maxTick,
          undefined,
          {
            currency: osmoCurrency,
            amount: osmoSwapAmount,
          },
          {
            currency: ionCurrency,
            amount: ionSwapAmount,
          },
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve();
          }
        )
        .catch(reject);
    });

    // swap in pool to incur fees
    await new Promise((resolve, reject) =>
      account!.osmosis
        .sendSwapExactAmountInMsg(
          [{ id: poolId, tokenOutDenom: "uion" }],
          { currency: osmoCurrency, amount: osmoSwapAmount },
          "9",
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject)
    );

    // swap in pool to incur fees
    await new Promise((resolve, reject) =>
      account!.osmosis
        .sendSwapExactAmountInMsg(
          [{ id: poolId, tokenOutDenom: "uion" }],
          { currency: osmoCurrency, amount: osmoSwapAmount },
          "9",
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject)
    );
  }

  async function getUserPositionsIds() {
    const account = accountStore.getWallet(TestOsmosisChainId);
    const osmosisQueries = queriesStore.get(TestOsmosisChainId).osmosis!;

    const positions = osmosisQueries.queryAccountsPositions.get(
      account!.address ?? ""
    );
    await positions.waitResponse();

    return positions.positionIds;
  }
});
