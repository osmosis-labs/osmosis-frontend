import {
  HasUsedOneClickTradingLocalStorageKey,
  type OneClickTradingInfo,
  OneClickTradingLocalStorageKey,
  UseOneClickTradingLocalStorageKey,
} from "@osmosis-labs/tx";
import { type KVStore, MemoryKVStore } from "@osmosis-labs/utils";

import { registerTestCleanup } from "~/__tests__/setup-tests";
import { OsmosisChainInfo } from "~/config/chain";
import { ChainList } from "~/config/generated/chain-list";
import { withCosmosKitFields } from "~/config/keplr-chain";

import { WalletRuntime } from "../wallet-runtime";

const runtimes = new Set<WalletRuntime>();
registerTestCleanup(async () => {
  for (const runtime of runtimes) await runtime.unmount();
  runtimes.clear();
});
function makeRuntime(storage: KVStore = new MemoryKVStore("account_store")) {
  const runtime = new WalletRuntime({
    chains: ChainList.map(withCosmosKitFields),
    assets: [],
    osmosisChainId: OsmosisChainInfo.chainId,
    storage,
  });
  runtimes.add(runtime);
  return runtime;
}
const info = {
  authenticatorId: "1",
  sessionKey: "AQ==",
  publicKey: "public",
  userOsmoAddress: "owner",
  allowedMessages: ["/allowed"],
  sessionPeriod: { end: "9999999999999999999" },
  sessionStartedAtUnix: 1,
  networkFeeLimit: "100",
  spendLimit: { amount: "10", decimals: 6 },
  humanizedSessionPeriod: "1day",
  hasSeenExpiryToast: false,
} satisfies OneClickTradingInfo;

it("preserves newer session and preference writes while hydration is pending", async () => {
  const readers: ((value: undefined) => void)[] = [];
  const values = new Map<string, unknown>();
  const storage: KVStore = {
    prefix: () => "account_store",
    get: <T>() =>
      new Promise<T | undefined>((resolve) => readers.push(resolve)),
    set: async (key, value) => {
      values.set(key, value);
    },
  };
  const runtime = makeRuntime(storage);
  await runtime.setOneClickTradingInfo(info);
  await runtime.setShouldUseOneClickTrading({ nextValue: true });
  readers.forEach((resolve) => resolve(undefined));
  expect(await runtime.getOneClickTradingInfo()).toBe(info);
  expect(runtime.store.getState()).toMatchObject({
    useOneClickTrading: true,
    hasUsedOneClickTrading: true,
    isStateHydrated: true,
  });
  expect(values.get(OneClickTradingLocalStorageKey)).toBe(info);
  expect(values.get(UseOneClickTradingLocalStorageKey)).toBe(true);
});

it("serializes concurrent session writes and retains the last removal", async () => {
  const storage = new MemoryKVStore("account_store");
  const runtime = makeRuntime(storage);
  await runtime.getOneClickTradingInfo();
  const first = runtime.setOneClickTradingInfo(info);
  const second = runtime.setOneClickTradingInfo(undefined);
  expect(runtime.store.getState().oneClickTradingInfo).toBeNull();
  await Promise.all([first, second]);
  expect(await storage.get(OneClickTradingLocalStorageKey)).toBeNull();
  expect(await storage.get(HasUsedOneClickTradingLocalStorageKey)).toBe(true);
});

it("uses current account and chain state for eligibility and disables on removal", async () => {
  const runtime = makeRuntime();
  await runtime.setOneClickTradingInfo(info);
  await runtime.setShouldUseOneClickTrading({ nextValue: true });
  let address = "owner";
  jest
    .spyOn(runtime, "getWallet")
    .mockImplementation(
      () => ({ address }) as NonNullable<ReturnType<WalletRuntime["getWallet"]>>
    );
  const request = { messages: [{ typeUrl: "/allowed", value: {} }] };
  expect(await runtime.shouldBeSignedWithOneClickTrading(request)).toBe(true);
  address = "other";
  expect(await runtime.shouldBeSignedWithOneClickTrading(request)).toBe(false);
  address = "owner";
  expect(
    await runtime.shouldBeSignedWithOneClickTrading({
      ...request,
      chainId: "cosmoshub-4",
    })
  ).toBe(false);
  expect(
    await runtime.shouldBeSignedWithOneClickTrading({
      messages: [{ typeUrl: "/denied", value: {} }],
    })
  ).toBe(false);
  await runtime.setOneClickTradingInfo(undefined);
  expect(await runtime.shouldBeSignedWithOneClickTrading(request)).toBe(false);
});

it("keeps the committed session and preference when persistence fails", async () => {
  const storage = new MemoryKVStore("account_store");
  await storage.set(OneClickTradingLocalStorageKey, info);
  const runtime = makeRuntime(storage);
  expect(await runtime.getOneClickTradingInfo()).toEqual(info);
  jest
    .spyOn(storage, "set")
    .mockRejectedValue(new Error("storage unavailable"));
  await expect(runtime.setOneClickTradingInfo(undefined)).rejects.toThrow(
    "storage unavailable"
  );
  await expect(
    runtime.setShouldUseOneClickTrading({ nextValue: true })
  ).rejects.toThrow("storage unavailable");
  expect(await runtime.getOneClickTradingInfo()).toEqual(info);
  expect(runtime.store.getState().useOneClickTrading).toBe(false);
});

it("does not hydrate an enabled preference from a session removed during the reads", async () => {
  const readers = new Map<string, (value: unknown) => void>();
  const storage: KVStore = {
    prefix: () => "account_store",
    get: <T>(key: string) =>
      new Promise<T | undefined>((resolve) =>
        readers.set(key, resolve as (value: unknown) => void)
      ),
    set: async () => {},
  };
  const runtime = makeRuntime(storage);
  await runtime.setOneClickTradingInfo(undefined);
  readers.get(OneClickTradingLocalStorageKey)!(info);
  readers.get(UseOneClickTradingLocalStorageKey)!(true);
  readers.get(HasUsedOneClickTradingLocalStorageKey)!(true);
  expect(await runtime.getOneClickTradingInfo()).toBeUndefined();
  expect(runtime.store.getState()).toMatchObject({
    oneClickTradingInfo: null,
    useOneClickTrading: false,
    isStateHydrated: true,
  });
});
