/* eslint-disable */
import {
  chainId,
  RootStore,
  waitAccountLoaded,
} from "../../../__tests__/test-env";

jest.setTimeout(60000);

describe("Exit Pool Tx", () => {
  let { accountStore, queriesStore } = new RootStore();
  let poolId: string | undefined; // relies on `jest --runInBand` to work properly

  beforeEach(async () => {
    const account = accountStore.getWallet(chainId)!;
    await waitAccountLoaded(account);

    // And prepare the pool
    await new Promise<any>((resolve) => {
      account.osmosis.sendCreateBalancerPoolMsg(
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
        "",
        (tx) => {
          resolve(tx);
        }
      );
    });

    // refresh stores
    await queriesStore
      .get(chainId)
      .osmosis!.queryGammNumPools.waitFreshResponse();
    await queriesStore.get(chainId).osmosis!.queryGammPools.waitFreshResponse();

    // set poolId
    const numPools =
      queriesStore.get(chainId).osmosis!.queryGammNumPools.numPools;
    poolId = numPools.toString();
  });

  test("should fail with 0 share in amount", async () => {
    const account = accountStore.getWallet(chainId)!;

    await expect(
      account.osmosis.sendExitPoolMsg(poolId!, "0")
    ).rejects.not.toBeNull();
  });

  test("with 50 share in amount without slippage", async () => {
    const account = accountStore.getWallet(chainId)!;

    // Share는 최초로 100개가 발행된다 그러므로 여기서 50개를 exit하는 건 성공한다.
    await new Promise<any>((resolve, rejects) => {
      account.osmosis
        .sendExitPoolMsg(poolId!, "50", "0", "", (tx) => {
          resolve(tx);
        })
        .catch((e) => rejects(e));
    });
  });

  test("with 50 share in amount with slippage", async () => {
    const account = accountStore.getWallet(chainId)!;

    // Share는 최초로 100개가 발행된다 그러므로 여기서 50개를 exit하는 건 성공한다.
    await new Promise<any>((resolve, rejects) => {
      account.osmosis
        .sendExitPoolMsg(poolId!, "50", "1", "", (tx) => {
          resolve(tx);
        })
        .catch((e) => rejects(e));
    });
  });

  test("should fail with more max share in amount", async () => {
    const account = accountStore.getWallet(chainId)!;

    // Share는 최초로 100개가 발행된다 그러므로 여기서 100.01개를 exit하는 건 실패한다.
    await expect(
      account.osmosis.sendExitPoolMsg(poolId!, "100.01", "1")
    ).rejects.not.toBeNull();
  });
});
