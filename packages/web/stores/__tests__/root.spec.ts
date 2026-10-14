import { ChainIdHelper } from "@osmosis-labs/keplr-stores";
import type { DeliverTxResponse, TxEvents } from "@osmosis-labs/stores";

import { registerTestCleanup } from "~/__tests__/setup-tests";
import { prettifyTxError } from "~/components/alert/prettify";
import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { OsmosisChainInfo, StaticChainGetter } from "~/config/chain";

import { RootStore } from "../root";

jest.mock("~/components/alert/toast", () => ({ displayToast: jest.fn() }));
jest.mock("~/components/alert/prettify", () => ({
  prettifyTxError: jest.fn((message) => message),
}));

const stores = new Set<RootStore>();
registerTestCleanup(() => {
  for (const { accountStore } of stores) {
    const manager = accountStore.walletManager;
    manager.onUnmounted();
    if (manager.session.timeoutId !== undefined) {
      clearTimeout(manager.session.timeoutId as ReturnType<typeof setTimeout>);
    }
  }
  stores.clear();
  localStorage.clear();
});

function createStore(txEvents?: TxEvents) {
  const store = new RootStore({ txEvents });
  stores.add(store);
  return store.accountStore;
}

beforeEach(() => jest.clearAllMocks());

describe("RootStore static chain wiring", () => {
  const { identifier } = ChainIdHelper.parse(OsmosisChainInfo.chainId);

  it("resolves identifiers and revisions with configured currency metadata", () => {
    const accountStore = createStore();
    const chain = accountStore["chainGetter"].getChain(identifier);
    const currency = OsmosisChainInfo.currencies.find(
      (currency) => currency.coinMinimalDenom === "uosmo"
    )!;

    expect(accountStore.osmosisChainId).toBe(OsmosisChainInfo.chainId);
    expect(chain.chainId).toBe(OsmosisChainInfo.chainId);
    expect(StaticChainGetter.getChain(`${identifier}-999`).chainId).toBe(
      OsmosisChainInfo.chainId
    );
    expect(currency).toMatchObject({ coinDenom: "OSMO", coinDecimals: 6 });
    expect(chain.forceFindCurrency("uosmo")).toEqual(currency);
    expect(chain.feeCurrencies).toEqual(OsmosisChainInfo.feeCurrencies);
    expect(chain.stakeCurrency).toEqual(OsmosisChainInfo.stakeCurrency);
    expect(() => StaticChainGetter.getChain("unknown-chain")).toThrow();
  });

  it("runs caller callbacks before transaction toasts and preserves explorer links", () => {
    const txEvents = {
      onBroadcastFailed: jest.fn(),
      onBroadcasted: jest.fn(),
      onFulfill: jest.fn(),
      onSign: jest.fn(),
    };
    const accountStore = createStore(txEvents);
    const events = accountStore["options"].preTxEvents!;
    const error = new Error("insufficient funds");
    const hash = new Uint8Array([0xab, 0xcd]);
    const tx = { code: 0, transactionHash: "abcd" } as DeliverTxResponse;

    events.onBroadcastFailed!(identifier, error);
    expect(txEvents.onBroadcastFailed).toHaveBeenCalledWith(identifier, error);
    expect(prettifyTxError).toHaveBeenCalledWith(
      error.message,
      OsmosisChainInfo.currencies
    );
    expect(displayToast).toHaveBeenLastCalledWith(
      expect.objectContaining({ titleTranslationKey: "transactionFailed" }),
      ToastType.ERROR
    );

    events.onBroadcasted!(identifier, hash);
    expect(txEvents.onBroadcasted).toHaveBeenCalledWith(identifier, hash);
    expect(displayToast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        titleTranslationKey: "transactionBroadcasting",
      }),
      ToastType.LOADING,
      { toastId: "broadcast" }
    );

    events.onFulfill!(identifier, tx);
    expect(txEvents.onFulfill).toHaveBeenCalledWith(identifier, tx);
    expect(displayToast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        titleTranslationKey: "transactionSuccessful",
        learnMoreUrl: OsmosisChainInfo.explorerUrlToTx.replace(
          "{txHash}",
          "ABCD"
        ),
      }),
      ToastType.SUCCESS
    );
    expect(txEvents.onFulfill.mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(displayToast).mock.invocationCallOrder[2]
    );
    expect(events.onSign).toBe(txEvents.onSign);
  });
});
