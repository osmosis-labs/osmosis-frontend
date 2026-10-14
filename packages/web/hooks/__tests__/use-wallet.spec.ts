import { act, renderHook, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { createElement, PropsWithChildren } from "react";

import {
  connectTestWallet,
  renderHookWithProviders,
} from "~/__tests__/test-utils";
import { testWalletInfo } from "~/__tests__/test-wallet";
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
        chainId: rootStore.chainStore.osmosis.chainId,
      })
    );
    const wallet = result.current.wallet!;
    const nextAddress = "osmo1differentaccount";

    act(() =>
      wallet.setData({
        namespace: "cosmos",
        chainId: rootStore.chainStore.osmosis.chainId,
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
});
