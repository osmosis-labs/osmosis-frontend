/* eslint-disable */
import { TestOsmosisChainId } from "../../tests/mock-data";
import {
  deepContained,
  getEventFromTx,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../tests/test-env";

describe("Lock Token Tx", () => {
  const { accountStore } = new RootStore({
    // fresh account
    mnemonic:
      "cream sport mango believe inhale text fish rely elegant below earth april wall rug ritual blossom cherry detail length blind digital proof identify ride",
  });

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    await waitAccountLoaded(account);

    // LocalOsmosis has no configured durations
  });

  it("locks tokens", async () => {
    const tx = await new Promise<any>(async (resolve, reject) => {
      await account?.osmosis
        .sendLockTokensMsg(
          600,
          [
            {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
              amount: "1",
            },
          ],
          undefined,
          (tx) => {
            resolve(tx);
          }
        )
        .catch(reject);
    });

    deepContained(
      {
        type: "coin_received",
        attributes: [
          {
            key: "amount",
            value: "1000000uosmo",
          },
        ],
      },
      getEventFromTx(tx, "coin_received")
    );
  });
});
