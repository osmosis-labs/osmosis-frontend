import { WalletStatus } from "@cosmos-kit/core";
import { when } from "mobx";

import { RootStore } from "../../tests/test-env";
import { testWalletInfo } from "../../tests/test-wallet";
import type { OneClickTradingInfo } from "../types";

const AddressB = "osmo1qyqszqgpqyqszqgpqyqszqgpqyqszqgpjnp7du";
const AddressC = "osmo1qgpqyqszqgpqyqszqgpqyqszqgpqyqszrh8mx2";

async function setup() {
  const { accountStore } = new RootStore();
  await accountStore.walletManager.onMounted();

  // Connect without sync, as the app does.
  await accountStore
    .getWalletRepo("localosmosis")
    .connect(testWalletInfo.name, false);

  const wallet = accountStore.getWallet("localosmosis")!;
  expect(wallet.walletStatus).toBe(WalletStatus.Connected);

  const client = wallet.client!;
  const getSimpleAccount = client.getSimpleAccount.bind(client);
  /** Make the next account read resolve to `address` once `release` is called. */
  const nextAccount = (address: string) => {
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    jest
      .spyOn(client, "getSimpleAccount")
      .mockImplementationOnce(async (chainId) => {
        await released;
        return { ...(await getSimpleAccount(chainId)), address };
      });
    return release;
  };
  const switchAccount = () =>
    window.dispatchEvent(new Event("keplr_keystorechange"));
  const flush = () => new Promise((resolve) => setTimeout(resolve, 50));

  return { accountStore, client, nextAccount, switchAccount, flush };
}

describe("AccountStore keystore change", () => {
  it("re-fetches connected chain wallets without connecting the others", async () => {
    const { accountStore, client, nextAccount, switchAccount } = await setup();
    // Active (looked up) but never connected.
    const cosmosRepo = accountStore.getWalletRepo("cosmoshub-4");

    nextAccount(AddressB)();
    switchAccount();

    await when(
      () => accountStore.getWallet("localosmosis")?.address === AddressB,
      { timeout: 5_000 }
    );
    expect(client.getSimpleAccount).toHaveBeenCalledTimes(1);
    expect(cosmosRepo.wallets[0].walletStatus).toBe(WalletStatus.Disconnected);
  });

  it("ends on the latest account when switches overlap", async () => {
    const { accountStore, nextAccount, switchAccount, flush } = await setup();

    const releaseB = nextAccount(AddressB);
    switchAccount();
    const releaseC = nextAccount(AddressC);
    switchAccount();

    // The stale read lands first and must not be committed.
    releaseB();
    await flush();
    expect(accountStore.getWallet("localosmosis")?.address).not.toBe(AddressB);

    releaseC();
    await when(
      () => accountStore.getWallet("localosmosis")?.address === AddressC,
      { timeout: 5_000 }
    );
    expect(accountStore.getWallet("localosmosis")?.walletStatus).toBe(
      WalletStatus.Connected
    );
  });

  it("stops using the one-click session of the previous account", async () => {
    const { accountStore, nextAccount, switchAccount } = await setup();
    const messages = [{ typeUrl: "/test.MsgSwap", value: {} }];

    await accountStore.setOneClickTradingInfo({
      userOsmoAddress: accountStore.getWallet("localosmosis")!.address!,
      allowedMessages: ["/test.MsgSwap"],
      // Ends an hour from now, in nanoseconds.
      sessionPeriod: { end: String((Date.now() + 3_600_000) * 1_000_000) },
    } as unknown as OneClickTradingInfo);
    await accountStore.setShouldUseOneClickTrading({ nextValue: true });
    expect(
      await accountStore.shouldBeSignedWithOneClickTrading({ messages })
    ).toBe(true);

    nextAccount(AddressB)();
    switchAccount();
    await when(
      () => accountStore.getWallet("localosmosis")?.address === AddressB,
      { timeout: 5_000 }
    );

    expect(
      await accountStore.shouldBeSignedWithOneClickTrading({ messages })
    ).toBe(false);
  });

  it("does not reconnect a wallet disconnected during a refresh", async () => {
    const { accountStore, nextAccount, switchAccount, flush } = await setup();

    const releaseB = nextAccount(AddressB);
    switchAccount();
    await accountStore
      .getWalletRepo("localosmosis")
      .disconnect(testWalletInfo.name, false);

    releaseB();
    await flush();
    const wallet = accountStore.getWalletRepo("localosmosis").wallets[0];
    expect(wallet.walletStatus).toBe(WalletStatus.Disconnected);
    expect(wallet.address).toBeUndefined();
  });

  it("keeps the account of a reconnect made during a refresh", async () => {
    const { accountStore, nextAccount, switchAccount, flush } = await setup();
    const repo = accountStore.getWalletRepo("localosmosis");

    const releaseB = nextAccount(AddressB);
    switchAccount();
    await repo.disconnect(testWalletInfo.name, false);
    nextAccount(AddressC)();
    await repo.connect(testWalletInfo.name, false);
    expect(accountStore.getWallet("localosmosis")?.address).toBe(AddressC);

    releaseB();
    await flush();
    expect(accountStore.getWallet("localosmosis")?.address).toBe(AddressC);
  });
});
