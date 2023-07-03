/* eslint-disable */
import { Dec, DecUtils, CoinPretty } from "@keplr-wallet/unit";
import {
  chainId,
  deepContained,
  getEventFromTx,
  getLatestQueryPool,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { estimateJoinSwap } from "@osmosis-labs/math";
import { ObservableQueryPool } from "../../queries";

describe("Join Pool Tx", () => {
  let { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined; // relies on `jest --runInBand` to work properly

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, chainId);
    account = accountStore.getWallet(chainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    // Init new localnet per test
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

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  test("with no max slippage", async () => {
    const account = accountStore.getWallet(chainId);

    const shareOutAmount = "1";
    const maxSlippage = "0";

    const sharePool = queryPool!.sharePool!;

    const estimated = estimateJoinSwap(
      sharePool,
      sharePool.poolAssets,
      (coin) =>
        new CoinPretty(
          queryPool!.poolAssets.find(
            (a) => a.amount.toCoin().denom === coin.denom
          )!.amount.currency,
          coin.amount
        ),
      shareOutAmount,
      18
    );

    const tx = await new Promise<any>((resolve, rejects) => {
      account?.osmosis
        .sendJoinPoolMsg(
          queryPool!.id,
          shareOutAmount,
          maxSlippage,
          "",
          (tx) => {
            resolve(tx);
          }
        )
        .catch((e) => rejects(e));
    });

    deepContained(
      {
        type: "message",
        attributes: [
          { key: "action", value: "/osmosis.gamm.v1beta1.MsgJoinPool" },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account?.address,
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
                  .mul(
                    DecUtils.getTenExponentNInPrecisionRange(
                      tokenIn.currency.coinDecimals
                    )
                  )
                  .truncate();

                return amount.toString() + tokenIn.currency.coinMinimalDenom;
              })
              .join(","),
          },
        ].concat([
          {
            key: "amount",
            value: `${new Dec(shareOutAmount)
              .mul(DecUtils.getTenExponentNInPrecisionRange(18))
              .truncate()
              .toString()}gamm/pool/${queryPool!.id}`,
          },
        ]),
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("with slippage", async () => {
    const account = accountStore.getWallet(chainId);

    const shareOutAmount = "1";
    const maxSlippage = "0.1";

    const sharePool = queryPool!.sharePool;
    if (!sharePool) throw new Error("Not share pool");

    const estimated = estimateJoinSwap(
      sharePool,
      sharePool.poolAssets,
      (coin) =>
        new CoinPretty(
          // eslint-disable-next-line
          queryPool!.poolAssets.find(
            (a) => a.amount.toCoin().denom === coin.denom
          )!.amount.currency,
          coin.amount
        ),
      shareOutAmount,
      18
    );

    const tx = await new Promise<any>((resolve, rejects) => {
      account?.osmosis
        .sendJoinPoolMsg(
          queryPool!.id,
          shareOutAmount,
          maxSlippage,
          "",
          (tx) => {
            resolve(tx);
          }
        )
        .catch((e) => rejects(e));
    });

    deepContained(
      {
        type: "message",
        attributes: [
          { key: "action", value: "/osmosis.gamm.v1beta1.MsgJoinPool" },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account?.address,
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
                  .mul(
                    DecUtils.getTenExponentNInPrecisionRange(
                      tokenIn.currency.coinDecimals
                    )
                  )
                  .truncate();

                return amount.toString() + tokenIn.currency.coinMinimalDenom;
              })
              .join(","),
          },
        ].concat([
          {
            key: "amount",
            value: `${new Dec(shareOutAmount)
              .mul(DecUtils.getTenExponentNInPrecisionRange(18))
              .roundUp()
              .toString()}gamm/pool/${queryPool!.id}`,
          },
        ]),
      },
      getEventFromTx(tx, "transfer")
    );
  });
});
