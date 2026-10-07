/* eslint-disable import/no-extraneous-dependencies */
import { ChainRegistryFetcher } from "@chain-registry/client";
import { WalletStatus } from "@cosmos-kit/core";
import { AccountStore } from "@osmosis-labs/stores";
import { useQueryClient } from "@tanstack/react-query";
import { act, waitFor } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { http, HttpResponse } from "msw";

import { dungeonAssetList, dungeonAssetListUrl, server } from "~/__tests__/msw";
import {
  cleanupTestResources,
  settleTestWork,
} from "~/__tests__/test-lifecycle";
import {
  connectTestWallet,
  renderHookWithProviders,
  waitTestAccountLoaded,
} from "~/__tests__/test-utils";
import { ChainList } from "~/config/generated/chain-list";
import { useWalletSelect } from "~/hooks/use-wallet-select";

async function renderReadyProvider() {
  const view = renderHookWithProviders(() => ({
    client: useQueryClient(),
    walletSelect: useWalletSelect(),
  }));
  await waitFor(() =>
    expect(view.result.current.walletSelect.isLoading).toBe(false)
  );
  return view;
}

it("loads the missing RootStore asset list through the exact local registry handler", async () => {
  const matched = jest.fn();
  const unhandled = jest.fn();
  server.events.on("request:match", matched);
  server.events.on("request:unhandled", unhandled);
  try {
    const { rootStore } = await renderReadyProvider();
    await settleTestWork();
    expect(matched).toHaveBeenCalledTimes(1);
    expect(matched.mock.calls[0][0].request.url).toBe(dungeonAssetListUrl);
    expect(unhandled).not.toHaveBeenCalled();
    expect(
      rootStore.accountStore.getWalletRepo("dungeon1").chainRecord.assetList
    ).toEqual(dungeonAssetList);
  } finally {
    server.events.removeListener("request:match", matched);
    server.events.removeListener("request:unhandled", unhandled);
  }
});

it("keeps teardown pending until registry response parsing and state updates finish", async () => {
  let release!: () => void;
  let started!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requestStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  server.use(
    http.get(dungeonAssetListUrl, async () => {
      started();
      await responseGate;
      return HttpResponse.json(dungeonAssetList);
    })
  );

  const { rootStore, unmount } = await renderReadyProvider();
  await requestStarted;
  unmount();
  let finished = false;
  const teardown = cleanupTestResources().then(() => {
    finished = true;
  });
  try {
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(
      rootStore.accountStore.getWalletRepo("dungeon1").chainRecord.assetList
    ).toBeUndefined();
  } finally {
    release();
    await teardown;
  }
  expect(finished).toBe(true);
  expect(
    rootStore.accountStore.getWalletRepo("dungeon1").chainRecord.assetList
  ).toEqual(dungeonAssetList);
});

it("reports registry fetch failures even if the caller catches the rejection", async () => {
  server.use(
    http.get(dungeonAssetListUrl, () => new HttpResponse(null, { status: 503 }))
  );
  const registry = new ChainRegistryFetcher({ urls: [dungeonAssetListUrl] });
  await expect(registry.fetchUrls()).rejects.toThrow("Bad response");
  await expect(settleTestWork()).rejects.toThrow("Test async work failed");
});

it("cancels pending provider queries and clears the cache before the next test", async () => {
  const { result, unmount } = await renderReadyProvider();
  const client = result.current.client;
  let signal!: AbortSignal;
  const query = client.fetchQuery({
    queryKey: ["lifecycle-pending-query"],
    queryFn: ({ signal: querySignal }) => {
      signal = querySignal;
      return new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("cancelled")), {
          once: true,
        });
      });
    },
  });
  const rejected = expect(query).rejects.toBeDefined();
  unmount();
  await cleanupTestResources();
  await rejected;
  expect(signal.aborted).toBe(true);
  expect(client.getQueryCache().getAll()).toHaveLength(0);
});

it("removes the connected test wallet's keystore listener and session timer", async () => {
  const add = jest.spyOn(window, "addEventListener");
  const remove = jest.spyOn(window, "removeEventListener");
  try {
    const { rootStore, unmount } = await renderReadyProvider();
    await act(async () => {
      await connectTestWallet({
        accountStore: rootStore.accountStore,
        chainId: ChainList[0].chain_id,
      });
    });
    const listener = add.mock.calls.find(
      ([name]) => name === "keplr_keystorechange"
    );
    expect(listener).toBeDefined();
    const manager = rootStore.accountStore.walletManager;
    const clear = jest.spyOn(window, "clearTimeout");
    try {
      unmount();
      await cleanupTestResources();
      expect(remove).toHaveBeenCalledWith("keplr_keystorechange", listener![1]);
      expect(clear).toHaveBeenCalledWith(manager.session.timeoutId);
    } finally {
      clear.mockRestore();
    }
  } finally {
    add.mockRestore();
    remove.mockRestore();
  }
});

describe("test account wait lifecycle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function account() {
    return observable({
      isReadyToSendTx: false,
      walletStatus: WalletStatus.Disconnected,
    }) as ReturnType<AccountStore["getWallet"]>;
  }

  it("disposes the timeout and reaction when the account becomes ready", async () => {
    const wallet = account()!;
    const loaded = waitTestAccountLoaded(wallet);
    runInAction(() => {
      wallet.isReadyToSendTx = true;
      // Only these test-observable fields are written, not a real wallet.
      (wallet as { walletStatus: WalletStatus }).walletStatus =
        WalletStatus.Connected;
    });
    await loaded;
    expect(jest.getTimerCount()).toBe(0);
  });

  it("rejects on timeout without leaving timers or an unhandled cancellation", async () => {
    const rejected = expect(waitTestAccountLoaded(account())).rejects.toThrow(
      "WHEN_TIMEOUT"
    );
    await jest.advanceTimersByTimeAsync(10_000);
    await rejected;
    expect(jest.getTimerCount()).toBe(0);
  });

  it("fails explicitly when the test account is absent", async () => {
    await expect(waitTestAccountLoaded(undefined)).rejects.toThrow(
      "Test account does not exist"
    );
    expect(jest.getTimerCount()).toBe(0);
  });
});
