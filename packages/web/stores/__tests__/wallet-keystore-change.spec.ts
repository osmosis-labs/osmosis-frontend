import { WalletStatus } from "@cosmos-kit/core";
import type { OneClickTradingInfo } from "@osmosis-labs/tx";
import { MemoryKVStore } from "@osmosis-labs/utils";
import { waitFor } from "@testing-library/react";

import { registerTestCleanup } from "~/__tests__/setup-tests";
import { TestWallet, testWalletInfo } from "~/__tests__/test-wallet";
import { OsmosisChainInfo } from "~/config/chain";
import { ChainList } from "~/config/generated/chain-list";
import { withCosmosKitFields } from "~/config/keplr-chain";

import { WalletRuntime } from "../wallet-runtime";

const runtimes = new Set<WalletRuntime>();
registerTestCleanup(async () => {
  for (const runtime of runtimes) await runtime.unmount();
  runtimes.clear();
});

const AddressB = "osmo1qyqszqgpqyqszqgpqyqszqgpqyqszqgpjnp7du";
const AddressC = "osmo1qgpqyqszqgpqyqszqgpqyqszqgpqyqszrh8mx2";

async function setup() {
  const runtime = new WalletRuntime({
    chains: ChainList.map(withCosmosKitFields),
    assets: [],
    osmosisChainId: OsmosisChainInfo.chainId,
    wallets: [new TestWallet(testWalletInfo)],
    storage: new MemoryKVStore("account_store"),
  });
  runtimes.add(runtime);
  await runtime.mount();

  // Connect without sync, as the app does.
  await runtime
    .getWalletRepo(OsmosisChainInfo.chainId)
    .connect(testWalletInfo.name, false);

  const wallet = runtime.getWallet(OsmosisChainInfo.chainId)!;
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

  return { runtime, client, nextAccount, switchAccount, flush };
}

describe("WalletRuntime keystore change", () => {
  it("re-fetches connected chain wallets without connecting the others", async () => {
    const { runtime, client, nextAccount, switchAccount } = await setup();
    // Active (looked up) but never connected.
    const cosmosRepo = runtime.getWalletRepo("cosmoshub-4");

    nextAccount(AddressB)();
    switchAccount();

    await waitFor(() =>
      expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).toBe(
        AddressB
      )
    );
    expect(client.getSimpleAccount).toHaveBeenCalledTimes(1);
    expect(cosmosRepo.wallets[0].walletStatus).toBe(WalletStatus.Disconnected);
  });

  it("ends on the latest account when switches overlap", async () => {
    const { runtime, nextAccount, switchAccount, flush } = await setup();

    const releaseB = nextAccount(AddressB);
    switchAccount();
    const releaseC = nextAccount(AddressC);
    switchAccount();

    // The stale read lands first and must not be committed.
    releaseB();
    await flush();
    expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).not.toBe(
      AddressB
    );

    releaseC();
    await waitFor(() =>
      expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).toBe(
        AddressC
      )
    );
    expect(runtime.getWallet(OsmosisChainInfo.chainId)?.walletStatus).toBe(
      WalletStatus.Connected
    );
  });

  it("stops using the one-click session of the previous account", async () => {
    const { runtime, nextAccount, switchAccount } = await setup();
    const messages = [{ typeUrl: "/test.MsgSwap", value: {} }];

    await runtime.setOneClickTradingInfo({
      userOsmoAddress: runtime.getWallet(OsmosisChainInfo.chainId)!.address!,
      allowedMessages: ["/test.MsgSwap"],
      // Ends an hour from now, in nanoseconds.
      sessionPeriod: { end: String((Date.now() + 3_600_000) * 1_000_000) },
    } as unknown as OneClickTradingInfo);
    await runtime.setShouldUseOneClickTrading({ nextValue: true });
    expect(await runtime.shouldBeSignedWithOneClickTrading({ messages })).toBe(
      true
    );

    nextAccount(AddressB)();
    switchAccount();
    await waitFor(() =>
      expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).toBe(
        AddressB
      )
    );

    expect(await runtime.shouldBeSignedWithOneClickTrading({ messages })).toBe(
      false
    );
  });

  it("does not reconnect a wallet disconnected during a refresh", async () => {
    const { runtime, nextAccount, switchAccount, flush } = await setup();

    const releaseB = nextAccount(AddressB);
    switchAccount();
    await runtime
      .getWalletRepo(OsmosisChainInfo.chainId)
      .disconnect(testWalletInfo.name, false);

    releaseB();
    await flush();
    const wallet = runtime.getWalletRepo(OsmosisChainInfo.chainId).wallets[0];
    expect(wallet.walletStatus).toBe(WalletStatus.Disconnected);
    expect(wallet.address).toBeUndefined();
  });

  it("keeps the account of a reconnect made during a refresh", async () => {
    const { runtime, nextAccount, switchAccount, flush } = await setup();
    const repo = runtime.getWalletRepo(OsmosisChainInfo.chainId);

    const releaseB = nextAccount(AddressB);
    switchAccount();
    await repo.disconnect(testWalletInfo.name, false);
    nextAccount(AddressC)();
    await repo.connect(testWalletInfo.name, false);
    expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).toBe(AddressC);

    releaseB();
    await flush();
    expect(runtime.getWallet(OsmosisChainInfo.chainId)?.address).toBe(AddressC);
  });
});
