import {
  HasUsedOneClickTradingLocalStorageKey,
  OneClickTradingLocalStorageKey,
  UseOneClickTradingLocalStorageKey,
} from "@osmosis-labs/tx";
import { makeLocalStorageKVStore } from "@osmosis-labs/utils";
import { act, renderHook, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { createElement, PropsWithChildren } from "react";

import {
  connectTestWallet,
  renderHookWithProviders,
} from "~/__tests__/test-utils";
import {
  MockKeplrClient,
  TestWallet,
  testWalletInfo,
} from "~/__tests__/test-wallet";
import { OsmosisChainInfo } from "~/config/chain";
import { ChainList } from "~/config/generated/chain-list";
import { storeContext } from "~/stores";

import { useWallet } from "../use-wallet";

describe("useWallet", () => {
  const chainId = ChainList[0].chain_id;

  it("re-renders a non-observer component when the wallet connects", async () => {
    let renders = 0;
    const { result, rootStore } = renderHookWithProviders(() => {
      renders++;
      return useWallet(chainId);
    });

    expect(result.current.isWalletConnected).toBe(false);
    expect(result.current.address).toBeUndefined();

    await act(() =>
      connectTestWallet({ accountStore: rootStore.accountStore, chainId })
    );

    await waitFor(() => {
      expect(result.current.isWalletConnected).toBe(true);
      expect(result.current.address).toBeTruthy();
      expect(result.current.isReadyToSendTx).toBe(true);
    });
    expect(renders).toBeGreaterThan(1);
  });

  it("keeps the same snapshot while nothing changes", async () => {
    const { result, rerender } = renderHookWithProviders(() =>
      useWallet(chainId)
    );
    await waitFor(() => expect(result.current.isStateHydrated).toBe(true));
    const first = result.current;

    await act(async () => {
      rerender();
      rerender();
    });

    expect(result.current).toBe(first);
  });

  it("follows the tx in progress", async () => {
    const { result, rootStore } = renderHookWithProviders(() =>
      useWallet(chainId)
    );
    await act(() =>
      connectTestWallet({ accountStore: rootStore.accountStore, chainId })
    );

    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "swap")
      );
    });
    await waitFor(() => expect(result.current.txTypeInProgress).toBe("swap"));

    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "")
      );
    });
    await waitFor(() => expect(result.current.txTypeInProgress).toBe(""));
  });

  it("follows account changes and disconnects without changing wallet instances", async () => {
    const { result, rootStore } = renderHookWithProviders(() => useWallet());
    await act(() =>
      connectTestWallet({
        accountStore: rootStore.accountStore,
        chainId: OsmosisChainInfo.chainId,
      })
    );
    const wallet = result.current.wallet!;
    const nextAddress = "osmo1differentaccount";

    act(() =>
      wallet.setData({
        namespace: "cosmos",
        chainId: OsmosisChainInfo.chainId,
        address: nextAddress,
      })
    );

    expect(result.current.wallet).toBe(wallet);
    expect(result.current.address).toBe(nextAddress);

    await act(() => wallet.disconnect(true));

    expect(result.current.address).toBeUndefined();
    expect(result.current.isWalletConnected).toBe(false);
    expect(result.current.isReadyToSendTx).toBe(false);
  });

  it("keeps remaining subscribers current when another subscriber unmounts", async () => {
    const first = renderHookWithProviders(() => useWallet(chainId));
    const { rootStore } = first;
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(storeContext.Provider, { value: rootStore }, children);
    const second = renderHook(() => useWallet(chainId), { wrapper });

    await act(() =>
      connectTestWallet({ accountStore: rootStore.accountStore, chainId })
    );
    expect(first.result.current).toBe(second.result.current);
    expect(second.result.current.address).toBeTruthy();

    first.unmount();
    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "swap")
      );
    });
    expect(second.result.current.txTypeInProgress).toBe("swap");

    second.unmount();
    runInAction(() =>
      rootStore.accountStore.txTypeInProgressByChain.set(chainId, "")
    );
    const remounted = renderHook(() => useWallet(chainId), { wrapper });
    expect(remounted.result.current.txTypeInProgress).toBe("");

    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "join")
      );
    });
    expect(remounted.result.current.txTypeInProgress).toBe("join");
  });

  it("switches chains and stops following the previous chain", async () => {
    const otherChainId = ChainList.find(
      (chain) => chain.chain_id !== chainId
    )!.chain_id;
    const { result, rootStore, rerender } = renderHookWithProviders(
      ({ selectedChainId }) => useWallet(selectedChainId),
      { initialProps: { selectedChainId: chainId } }
    );
    await act(async () => {
      await connectTestWallet({
        accountStore: rootStore.accountStore,
        chainId,
      });
      await rootStore.accountStore
        .getWalletRepo(otherChainId)
        .connect(testWalletInfo.name, true);
    });
    act(() => {
      runInAction(() => {
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "swap");
        rootStore.accountStore.txTypeInProgressByChain.set(
          otherChainId,
          "join"
        );
      });
    });
    expect(result.current.txTypeInProgress).toBe("swap");

    rerender({ selectedChainId: otherChainId });
    expect(result.current.wallet?.chainId).toBe(otherChainId);
    expect(result.current.txTypeInProgress).toBe("join");
    const snapshot = result.current;

    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(chainId, "")
      );
    });
    expect(result.current).toBe(snapshot);

    act(() => {
      runInAction(() =>
        rootStore.accountStore.txTypeInProgressByChain.set(otherChainId, "")
      );
    });
    expect(result.current.txTypeInProgress).toBe("");
  });
  it("clears transaction progress when no wallet exists", async () => {
    const { result, rootStore } = renderHookWithProviders(() =>
      useWallet(chainId)
    );
    await act(async () => {
      await expect(
        rootStore.accountStore.signAndBroadcast(chainId, "swap", [])
      ).rejects.toThrow("is not provided");
    });
    expect(result.current.txTypeInProgress).toBe("");
    expect(rootStore.accountStore.txTypeInProgressByChain.get(chainId)).toBe(
      ""
    );
  });

  it("follows a replacement manager and disconnects through the hook", async () => {
    const { result, rootStore } = renderHookWithProviders(() =>
      useWallet(chainId)
    );
    await act(() =>
      connectTestWallet({ accountStore: rootStore.accountStore, chainId })
    );
    const previous = result.current.wallet;
    const manager = rootStore.accountStore.walletManager;
    const unmount = jest.spyOn(manager, "onUnmounted");
    const timer = manager.session.timeoutId;
    const clearTimer = jest.spyOn(globalThis, "clearTimeout");
    await act(async () => {
      await rootStore.walletRuntime.installWallet(
        new TestWallet(testWalletInfo)
      );
      await rootStore.walletRuntime.mount();
      await result.current.connect(testWalletInfo.name, true);
    });
    expect(unmount).toHaveBeenCalledTimes(1);
    if (timer !== undefined) expect(clearTimer).toHaveBeenCalledWith(timer);
    clearTimer.mockRestore();
    expect(result.current.wallet).not.toBe(previous);
    expect(result.current.isWalletConnected).toBe(true);
    await act(() => result.current.disconnect());
    expect(result.current.isWalletConnected).toBe(false);
    expect(result.current.address).toBeUndefined();
  });

  it("hydrates one-click state from the existing persistence keys", async () => {
    const storage = makeLocalStorageKVStore("account_store");
    await storage.set(HasUsedOneClickTradingLocalStorageKey, true);
    await storage.set(UseOneClickTradingLocalStorageKey, true);
    await storage.set(OneClickTradingLocalStorageKey, null);
    const { result, rootStore } = renderHookWithProviders(() => useWallet());
    await waitFor(() => expect(result.current.isStateHydrated).toBe(true));
    expect(result.current.hasUsedOneClickTrading).toBe(true);
    // A preference alone cannot enable trading without a session.
    expect(result.current.useOneClickTrading).toBe(false);
    expect(result.current.oneClickTradingInfo).toBeNull();
    await act(() =>
      rootStore.accountStore.setShouldUseOneClickTrading({ nextValue: true })
    );
    expect(result.current.useOneClickTrading).toBe(true);
    expect(await storage.get(UseOneClickTradingLocalStorageKey)).toBe(true);
  });

  it("releases the compatibility subscription after the final subscriber", async () => {
    const first = renderHookWithProviders(() => useWallet(chainId));
    const { rootStore } = first;
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(storeContext.Provider, { value: rootStore }, children);
    const subscribe = jest.spyOn(rootStore.accountStore, "subscribeState");
    const second = renderHook(() => useWallet(chainId), { wrapper });
    expect(subscribe).not.toHaveBeenCalled();
    first.unmount();
    second.unmount();
    const remounted = renderHook(() => useWallet(chainId), { wrapper });
    expect(subscribe).toHaveBeenCalledTimes(1);
    remounted.unmount();
  });
  it("cleans up a pending mount before remounting the same manager", async () => {
    const { rootStore, result } = renderHookWithProviders(() =>
      useWallet(chainId)
    );
    await waitFor(() => expect(result.current.isStateHydrated).toBe(true));
    const manager = rootStore.accountStore.walletManager;
    let finish!: () => void;
    const mount = jest.spyOn(manager, "onMounted").mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const unmount = jest.spyOn(manager, "onUnmounted");
    const pending = rootStore.walletRuntime.mount();
    await waitFor(() => expect(finish).toBeDefined());
    await rootStore.walletRuntime.unmount();
    expect(unmount).toHaveBeenCalledTimes(1);
    const remount = rootStore.walletRuntime.mount();
    await Promise.resolve();
    expect(mount).toHaveBeenCalledTimes(1);
    const timer = setTimeout(() => {
      throw new Error("stale session timer");
    }, 60_000);
    manager.session.timeoutId = timer;
    const clearTimer = jest.spyOn(globalThis, "clearTimeout");
    await act(async () => {
      finish();
      await pending;
      await remount;
    });
    expect(mount).toHaveBeenCalledTimes(2);
    expect(unmount).toHaveBeenCalledTimes(2);
    expect(unmount.mock.invocationCallOrder[1]).toBeLessThan(
      mount.mock.invocationCallOrder[1]
    );
    expect(clearTimer).toHaveBeenCalledWith(timer);
    clearTimer.mockRestore();
  });

  it("mounts a replacement manager while the old restore awaits a wallet response", async () => {
    const { rootStore, result } = renderHookWithProviders(() => useWallet());
    await act(() =>
      connectTestWallet({
        accountStore: rootStore.accountStore,
        chainId: OsmosisChainInfo.chainId,
      })
    );
    // Recreate the manager with persisted accounts, as installation does on reload.
    await act(() =>
      rootStore.walletRuntime.installWallet(new TestWallet(testWalletInfo))
    );
    const previous = rootStore.accountStore.walletManager;
    const unmountPrevious = jest.spyOn(previous, "onUnmounted");
    let finish!: () => void;
    const getSimpleAccount = MockKeplrClient.prototype.getSimpleAccount;
    const accountLookup = jest
      .spyOn(MockKeplrClient.prototype, "getSimpleAccount")
      .mockImplementationOnce(async function (this: MockKeplrClient, chainId) {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        return getSimpleAccount.call(this, chainId);
      });
    const restoring = rootStore.walletRuntime.mount();
    await waitFor(() => expect(finish).toBeDefined());
    const queuedRestore = rootStore.walletRuntime.mount();
    await act(() => result.current.disconnect());
    const replacementWalletInfo = {
      ...testWalletInfo,
      name: "replacement-wallet",
    };
    await act(() =>
      rootStore.walletRuntime.installWallet(
        new TestWallet(replacementWalletInfo)
      )
    );
    const manager = rootStore.accountStore.walletManager;
    const mountReplacement = jest.spyOn(manager, "onMounted");
    const unmountReplacement = jest.spyOn(manager, "onUnmounted");
    const replacement = rootStore.walletRuntime.mount();
    try {
      await waitFor(() => expect(mountReplacement).toHaveBeenCalledTimes(1));
      await act(async () => {
        await replacement;
        await result.current.connect(replacementWalletInfo.name, true);
      });
      expect(result.current.isWalletConnected).toBe(true);
      expect(result.current.wallet?.walletName).toBe(
        replacementWalletInfo.name
      );
    } finally {
      await act(async () => {
        finish();
        await restoring;
        await queuedRestore;
        await replacement;
      });
      accountLookup.mockRestore();
    }
    expect(result.current.wallet?.walletName).toBe(replacementWalletInfo.name);
    expect(unmountPrevious).toHaveBeenCalledTimes(2);
    expect(mountReplacement).toHaveBeenCalledTimes(1);
    expect(unmountReplacement).not.toHaveBeenCalled();
  });
});
