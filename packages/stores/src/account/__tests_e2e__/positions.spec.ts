/* eslint-disable */
import { ObservableQueryPool } from "src/queries";
import {
  chainId,
  getLatestQueryPool,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { maxTick, minTick } from "@osmosis-labs/math";
// import { Int } from "@keplr-wallet/unit";

describe("Create CL Positions Txs", () => {
  const { accountStore, queriesStore, chainStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  beforeAll(async () => {
    const account = accountStore.getAccount(chainId);
    account.cosmos.broadcastMode = "sync";
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    const account = accountStore.getAccount(chainId);

    // prepare CL pool
    await new Promise((resolve, reject) =>
      account.osmosis.sendCreateConcentratedPoolMsg(
        "uion",
        "uosmo",
        1,
        0.001, // must have spread factor to generate fees
        undefined,
        (tx) => {
          if (tx.code) reject(tx.log);
          else resolve(tx);
        }
      )
    );

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  it("should be able to be created", async () => {
    await expect(createFullRangePosition(queryPool!.id)).resolves.toBeDefined();
    await expect(
      getUserPositionsIdsForPool(queryPool!.id)
    ).resolves.toHaveLength(1);
    await expect(createFullRangePosition(queryPool!.id)).resolves.toBeDefined();
    await expect(
      getUserPositionsIdsForPool(queryPool!.id)
    ).resolves.toHaveLength(2);
  });

  it("can have liquidity be added to it", async () => {
    const account = accountStore.getAccount(chainId);

    // create 2 positions, since there need to be at least 2 to be able to add liquidity
    await createFullRangePosition(queryPool!.id);
    await createFullRangePosition(queryPool!.id);
    const userPositionIds = await getUserPositionsIdsForPool(queryPool!.id);
    const lastPositionId = userPositionIds[userPositionIds.length - 1];

    // add liquidity to position
    const specifiedAmount0 = "1000";
    const calculatedAmount1 = "1000";

    await expect(
      new Promise((resolve, reject) =>
        account.osmosis
          .sendAddToConcentratedLiquidityPositionMsg(
            lastPositionId,
            specifiedAmount0,
            calculatedAmount1,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.log);
              else resolve(tx);
            }
          )
          .catch(reject)
      )
    ).resolves.toBeDefined();

    // old position is replaced
    await expect(
      getUserPositionsIdsForPool(queryPool!.id)
    ).resolves.toHaveLength(2);
  });

  it("rejects adding liquidity to position if last position in pool", async () => {
    const account = accountStore.getAccount(chainId);

    // create initial position
    await createFullRangePosition(queryPool!.id);
    const userPositionIds = await getUserPositionsIdsForPool(queryPool!.id);
    const lastPositionId = userPositionIds[userPositionIds.length - 1];

    // add liquidity to position
    const specifiedAmount0 = "1000";
    const calculatedAmount1 = "1000";

    await expect(
      new Promise((resolve, reject) =>
        account.osmosis
          .sendAddToConcentratedLiquidityPositionMsg(
            lastPositionId,
            specifiedAmount0,
            calculatedAmount1,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.log);
              else resolve(tx);
            }
          )
          .catch(reject)
      )
    ).rejects.toBeDefined();
  });

  /** Leave `poolId` undefined to get all position IDs. */
  async function getUserPositionsIdsForPool(poolId?: string) {
    const account = accountStore.getAccount(chainId);
    const osmosisQueries = queriesStore.get(chainId).osmosis!;

    const positions = osmosisQueries.queryAccountsPositions.get(
      account.bech32Address
    );
    await positions.waitFreshResponse();

    return positions.positions
      .filter((position) => !poolId || position.poolId === poolId)
      .map((position) => position.id);
  }

  function createFullRangePosition(poolId: string) {
    const account = accountStore.getAccount(chainId);

    const osmoCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency("uosmo");
    const osmoSwapAmount = "10";

    const ionCurrency = chainStore.getChain(chainId).forceFindCurrency("uion");
    const ionSwapAmount = "10";

    // prepare CL position
    return new Promise<any>((resolve, reject) => {
      account.osmosis.sendCreateConcentratedLiquidityPositionMsg(
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
        },
        undefined,
        undefined,
        (tx) => {
          if (tx.code) reject(tx.log);
          else resolve(tx);
        }
      );
    });
  }
});
