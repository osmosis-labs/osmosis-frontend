/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Currency } from "@keplr-wallet/types";
import { Int } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";

import {
  chainId,
  deepContained,
  getEventFromTx,
  getLatestQueryPool,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { ObservableQueryPool } from "../../queries";

describe("Test Swap Exact In - Concentrated Liquidity", () => {
  const { accountStore, queriesStore, chainStore } = new RootStore();
  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  let queryPool: ObservableQueryPool | undefined;

  beforeAll(async () => {
    await initAccount(accountStore, chainId);
    account = accountStore.getWallet(chainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    // And prepare the pool
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
            else resolve(tx);
          }
        )
        .catch(reject); // catch broadcast error
    });

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  it("handles basic swap - 1 full range position", async () => {
    await createPosition();

    const tokenInDenom = "uion";
    const tokenInAmount = "10";
    const tokenOutDenom = "uosmo";

    const tokenOutCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency(tokenOutDenom);

    const quote = await (
      queryPool!.pool as ConcentratedLiquidityPool
    ).getTokenOutByTokenIn(
      { denom: tokenInDenom, amount: new Int(tokenInAmount) },
      tokenOutDenom
    );

    const tx = await swapExactIn(
      tokenInDenom,
      tokenOutDenom,
      tokenInAmount,
      quote.amount.toString()
    );

    deepCompareSwapTx(
      tx,
      tokenInAmount,
      tokenInDenom,
      quote.amount,
      tokenOutCurrency
    );
  });

  /** Create position with current pool. Default full range. */
  function createPosition(
    minTick_ = minTick,
    maxTick_ = maxTick,
    osmoAmount = "1000",
    ionAmount = "1000"
  ) {
    const osmoCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency("uosmo");
    const ionCurrency = chainStore.getChain(chainId).forceFindCurrency("uion");

    // prepare CL position
    return new Promise<any>((resolve, reject) => {
      account!.osmosis
        .sendCreateConcentratedLiquidityPositionMsg(
          queryPool!.id,
          minTick_,
          maxTick_,
          {
            currency: osmoCurrency,
            amount: osmoAmount,
          },
          {
            currency: ionCurrency,
            amount: ionAmount,
          },
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else {
              try {
                queryPool!.waitFreshResponse().then(() => resolve(tx));
              } catch (e) {
                reject(e);
              }
            }
          }
        )
        .catch(reject); // catch broadcast error
    });
  }

  /** Swap through current pool. */
  function swapExactIn(
    tokenInDenom: string,
    tokenOutDenom: string,
    amountIn: string,
    minAmountOut: string
  ) {
    const tokenInCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency(tokenInDenom);
    return new Promise<any>((resolve, reject) => {
      account!.osmosis
        .sendSwapExactAmountInMsg(
          [{ id: queryPool!.id, tokenOutDenom }],
          {
            currency: tokenInCurrency,
            amount: amountIn,
          },
          minAmountOut,
          undefined,
          undefined,
          undefined,
          undefined,
          (tx: any) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject);
    });
  }

  /** Deep compare the result tx against the quote amount. */
  function deepCompareSwapTx(
    tx: any,
    tokenInAmount: string,
    tokenInMinDenom: string,
    quoteAmount: Int,
    tokenOutCurrency: Currency
  ) {
    // deep compare key events from tx result
    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
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

    // make sure amounts match
    deepContained(
      {
        type: "transfer",
        attributes: [
          { key: "amount", value: tokenInAmount + tokenInMinDenom },
          {
            key: "amount",
            value: quoteAmount.toString() + tokenOutCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  }
});
