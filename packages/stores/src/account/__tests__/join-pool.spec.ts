import { Dec, DecUtils, CoinPretty } from "@keplr-wallet/unit";
import {
  deepContained,
  getEventFromTx,
  initLocalnet,
  RootStore,
  waitAccountLoaded,
} from "../../../__tests__/test-env";
import { WeightedPoolEstimates } from "@osmosis-labs/math";

describe("Test Osmosis Join Pool Tx", () => {
  let { chainStore, accountStore, queriesStore } = new RootStore();

  beforeAll(async () => {
    jest.setTimeout(60000);
  });

  beforeEach(async () => {
    // Init new localnet per test
    await initLocalnet();

    const stores = new RootStore();
    chainStore = stores.chainStore;
    accountStore = stores.accountStore;
    queriesStore = stores.queriesStore;

    const account = accountStore.getAccount(chainStore.osmosis.chainId);
    await waitAccountLoaded(account);

    // And prepare the pool
    await new Promise<any>((resolve) => {
      account.osmosis.sendCreatePoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6,
              },
              amount: "100",
            },
          },
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
                coinDenom: "Foo",
                coinMinimalDenom: "ufoo",
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
  });

  test("Join Pool with no max slippage", async () => {
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getAccount(chainId);

    const poolId = "1";
    const shareOutAmount = "1";
    const maxSlippage = "0";

    // eslint-disable-next-line
    const queryPool = queriesStore
      .get(chainId)
      .osmosis!.queryGammPools.getPool(poolId)!;
    await queryPool.waitFreshResponse();
    const estimated = WeightedPoolEstimates.estimateJoinSwap(
      queryPool.pool,
      queryPool.pool.poolAssets,
      (coin) =>
        new CoinPretty(
          // eslint-disable-next-line
          queryPool.poolAssets.find(
            (a) => a.amount.toCoin().denom === coin.denom
          )!.amount.currency,
          coin.amount
        ),
      shareOutAmount,
      18
    );

    const tx = await new Promise<any>((resolve) => {
      account.osmosis.sendJoinPoolMsg(
        poolId,
        shareOutAmount,
        maxSlippage,
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
          { key: "action", value: "/osmosis.gamm.v1beta1.MsgJoinPool" },
          { key: "module", value: "gamm" },
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
        attributes: [
          {
            key: "amount",
            value: estimated.tokenIns
              .map((tokenIn) => {
                const amount = tokenIn
                  .toDec()
                  .mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
                  .truncate();

                return amount.toString() + tokenIn.currency.coinMinimalDenom;
              })
              .join(","),
          },
        ].concat([
          {
            key: "amount",
            value: `${new Dec(shareOutAmount)
              .mul(DecUtils.getPrecisionDec(18))
              .truncate()
              .toString()}gamm/pool/${poolId}`,
          },
        ]),
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("Join Pool with slippage", async () => {
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getAccount(chainId);

    const poolId = "1";
    const shareOutAmount = "1";
    const maxSlippage = "0.1";

    // eslint-disable-next-line
    const queryPool = queriesStore
      .get(chainId)
      .osmosis!.queryGammPools.getPool(poolId)!;
    await queryPool.waitFreshResponse();
    const estimated = WeightedPoolEstimates.estimateJoinSwap(
      queryPool.pool,
      queryPool.pool.poolAssets,
      (coin) =>
        new CoinPretty(
          // eslint-disable-next-line
          queryPool.poolAssets.find(
            (a) => a.amount.toCoin().denom === coin.denom
          )!.amount.currency,
          coin.amount
        ),
      shareOutAmount,
      18
    );

    const tx = await new Promise<any>((resolve) => {
      account.osmosis.sendJoinPoolMsg(
        poolId,
        shareOutAmount,
        maxSlippage,
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
          { key: "action", value: "/osmosis.gamm.v1beta1.MsgJoinPool" },
          { key: "module", value: "gamm" },
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
        attributes: [
          {
            key: "amount",
            value: estimated.tokenIns
              .map((tokenIn) => {
                const amount = tokenIn
                  .toDec()
                  .mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
                  .truncate();

                return amount.toString() + tokenIn.currency.coinMinimalDenom;
              })
              .join(","),
          },
        ].concat([
          {
            key: "amount",
            value: `${new Dec(shareOutAmount)
              .mul(DecUtils.getPrecisionDec(18))
              .truncate()
              .toString()}gamm/pool/${poolId}`,
          },
        ]),
      },
      getEventFromTx(tx, "transfer")
    );
  });
});
