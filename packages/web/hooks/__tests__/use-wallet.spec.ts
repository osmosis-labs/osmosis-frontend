import { act, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";

import {
  connectTestWallet,
  renderHookWithProviders,
} from "~/__tests__/test-utils";
import { ChainList } from "~/config/generated/chain-list";

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

    rerender();
    rerender();

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
});
