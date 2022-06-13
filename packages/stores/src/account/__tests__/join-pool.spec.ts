/* eslint-disable */
import { Dec, DecUtils, CoinPretty } from "@keplr-wallet/unit";
import {
  chainId,
  deepContained,
  getEventFromTx,
  initLocalnet,
  RootStore,
  waitAccountLoaded,
} from "../../__tests__/test-env";
import { WeightedPoolEstimates } from "@osmosis-labs/math";

jest.setTimeout(60000);

describe("Join Pool Tx", () => {
  let { accountStore, queriesStore } = new RootStore();

  beforeEach(async () => {
    // Init new localnet per test
    await initLocalnet();

    const stores = new RootStore();
    accountStore = stores.accountStore;
    queriesStore = stores.queriesStore;

    const account = accountStore.getAccount(chainId);
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

    // let pools load
    await queriesStore.get(chainId).osmosis!.queryGammPools.waitResponse();
  });

  test("with no max slippage", async () => {
    const account = accountStore.getAccount(chainId);

    const queriesOsmosis = queriesStore.get(chainId).osmosis!;

    const poolId = "1";
    const shareOutAmount = "1";
    const maxSlippage = "0";

    const queryPool = queriesOsmosis.queryGammPools.getPool(poolId)!;
    await queryPool.waitFreshResponse();
    const estimated = WeightedPoolEstimates.estimateJoinSwap(
      queryPool.pool,
      queryPool.pool.poolAssets,
      (coin) =>
        new CoinPretty(
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

  test("with slippage", async () => {
    const account = accountStore.getAccount(chainId);

    const poolId = "1";
    const shareOutAmount = "1";
    const maxSlippage = "0.1";

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
