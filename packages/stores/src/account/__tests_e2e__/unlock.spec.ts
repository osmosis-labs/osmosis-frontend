/* eslint-disable */
import {
  deepContained,
  getEventFromTx,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../tests/test-env";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { DeliverTxResponse } from "../types";
import { TestOsmosisChainId } from "../../tests/mock-data";
dayjs.extend(duration);

describe("Unbond Token Tx", () => {
  const { accountStore, queriesStore } = new RootStore({
    // fresh account
    mnemonic:
      "index light average senior silent limit usual local involve delay update rack cause inmate wall render magnet common feature laundry exact casual resource hundred",
  });
  let userLockIds: string[] | undefined;

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    // LocalOsmosis has no configured durations
    const queriesOsmosis = queriesStore.get(TestOsmosisChainId).osmosis!;
    const queriesAccountLocked = queriesOsmosis.queryAccountLocked.get(
      account?.address ?? ""
    );

    const durationSeconds = 1;
    const coin = {
      currency: {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
      },
      amount: "1",
    };

    await new Promise<DeliverTxResponse>(async (resolve, reject) => {
      await account?.osmosis
        .sendLockTokensMsg(durationSeconds, [coin], undefined, (tx) => {
          resolve(tx);
        })
        .catch(reject);
    });

    await queriesAccountLocked.waitFreshResponse();

    userLockIds = queriesAccountLocked.getLockedCoinWithDuration(
      coin.currency,
      dayjs.duration(durationSeconds * 1000)
    ).lockIds;
  });

  it("unlocks tokens", async () => {
    const tx = await new Promise<DeliverTxResponse>(async (resolve, reject) => {
      await account?.osmosis
        .sendBeginUnlockingMsg(userLockIds!, undefined, (tx) => {
          resolve(tx);
        })
        .catch(reject);
    });

    deepContained(
      {
        type: "begin_unlock",
        attributes: [{ key: "period_lock_id", value: userLockIds![0] }],
      },
      getEventFromTx(tx, "begin_unlock")
    );
  });
});
