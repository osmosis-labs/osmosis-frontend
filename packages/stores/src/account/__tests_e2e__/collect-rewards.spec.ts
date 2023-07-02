/* eslint-disable */
import { ObservableQueryPool } from "src/queries";
import {
  chainId,
  getLatestQueryPool,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { maxTick, minTick } from "@osmosis-labs/math";

describe("Collect Cl Fees Txs", () => {
  const { accountStore, queriesStore, chainStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  beforeAll(async () => {
    const account = accountStore.getWallet(chainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    const account = accountStore.getWallet(chainId);

    // prepare CL pool
    await account?.osmosis.sendCreateConcentratedPoolMsg(
      "uion",
      "uosmo",
      1,
      0.001, // must have spread factor to generate fees
      undefined
    );

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  it("should collect fees", async () => {
    await swapInPool(queryPool!.id);

    const account = accountStore.getWallet(chainId);
    const userPositionIds = await getUserPositionsIds();
    await expect(
      new Promise((resolve, reject) =>
        account?.osmosis.sendCollectAllPositionsRewardsMsgs(
          userPositionIds,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
      )
    ).resolves.toBeDefined(); // resolve to successful tx obj
  });

  it("should reject if no fees to collect", async () => {
    // DONT swap in pools
    // await swapInPool(queryPool!.id);

    const account = accountStore.getWallet(chainId);
    const userPositionIds = await getUserPositionsIds();
    await expect(
      new Promise((resolve, reject) =>
        account?.osmosis
          .sendCollectAllPositionsRewardsMsgs(
            userPositionIds,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve(tx);
            }
          )
          .catch(reject)
          .then(resolve)
      )
    ).rejects.toBeDefined();
  });

  // TODO setup test with incentive rewards once we add incentive creation txs

  async function swapInPool(poolId: string) {
    const account = accountStore.getWallet(chainId);

    const osmoCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency("uosmo");
    const osmoSwapAmount = "10";

    const ionCurrency = chainStore.getChain(chainId).forceFindCurrency("uion");
    const ionSwapAmount = "10";

    // prepare CL position
    await account?.osmosis.sendCreateConcentratedLiquidityPositionMsg(
      poolId,
      minTick,
      maxTick,
      {
        currency: osmoCurrency,
        amount: osmoSwapAmount,
      },
      {
        currency: ionCurrency,
        amount: ionSwapAmount,
      }
    );

    // swap in pool to incur fees
    await new Promise((resolve, reject) =>
      account?.osmosis.sendSwapExactAmountInMsg(
        [{ id: poolId, tokenOutDenom: "uion" }],
        { currency: osmoCurrency, amount: osmoSwapAmount },
        "9",
        undefined,
        undefined,
        undefined,
        (tx) => {
          if (tx.code) reject(tx.log);
          else resolve(tx);
        }
      )
    );

    // swap in pool to incur fees
    await new Promise((resolve, reject) =>
      account?.osmosis.sendSwapExactAmountInMsg(
        [{ id: poolId, tokenOutDenom: "uion" }],
        { currency: osmoCurrency, amount: osmoSwapAmount },
        "9",
        undefined,
        undefined,
        undefined,
        (tx) => {
          if (tx.code) reject(tx.log);
          else resolve(tx);
        }
      )
    );
  }

  async function getUserPositionsIds() {
    const account = accountStore.getWallet(chainId);
    const osmosisQueries = queriesStore.get(chainId).osmosis!;

    const positions = osmosisQueries.queryAccountsPositions.get(
      account?.address ?? ""
    );
    await positions.waitResponse();

    return positions.positionIds;
  }
});
