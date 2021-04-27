import {
  deepContained,
  getEventFromTx,
  initLocalnet,
  RootStore,
  waitAccountLoaded
} from "../../test-env";

describe("Test Osmosis Txs", () => {
  const { chainStore, accountStore } = new RootStore();

  beforeAll(async () => {
    jest.setTimeout(60000);

    await initLocalnet();

    const account = accountStore.getAccount(chainStore.current.chainId);
    account.broadcastMode = "block";
    await waitAccountLoaded(account);
  });

  test("CreatePool should fail with 0 assets", async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);

    await expect(
      account.osmosis.sendCreatePoolMsg("0", [], "", _ => {})
    ).rejects.not.toBeNull();
  });

  test("CreatePool should fail with 1 assets", async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);

    await expect(
      account.osmosis.sendCreatePoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6
              },
              amount: "10000"
            }
          }
        ],
        "",
        _ => {}
      )
    ).rejects.not.toBeNull();
  });

  test("CreatePool should fail with duplicated assets", async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);

    await expect(
      account.osmosis.sendCreatePoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6
              },
              amount: "10000"
            }
          },
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6
              },
              amount: "10000"
            }
          }
        ],
        "",
        _ => {}
      )
    ).rejects.not.toBeNull();
  });

  test("Test CreatePool msg with 0 swap fee", async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);

    const tx = await new Promise<any>(resolve => {
      account.osmosis.sendCreatePoolMsg(
        "0",
        [
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "ATOM",
                coinMinimalDenom: "uatom",
                coinDecimals: 6
              },
              amount: "10000"
            }
          },
          {
            weight: "100",
            token: {
              currency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6
              },
              amount: "10000"
            }
          }
        ],
        "",
        tx => {
          resolve(tx);
        }
      );
    });

    const event = getEventFromTx(tx, "message");
    deepContained(
      {
        type: "message",
        attributes: [
          { key: "action", value: "create_pool" },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account.bech32Address
          }
        ]
      },
      event
    );
  });
});
