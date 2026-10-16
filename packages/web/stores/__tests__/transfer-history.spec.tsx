import { TxSnapshot } from "@osmosis-labs/bridge";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

import { useTranslation } from "~/hooks";

import { PendingTransferCaption } from "../transfer-history";

jest.mock("~/hooks", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("~/components/alert/toast", () => ({
  displayToast: jest.fn(),
}));

describe("PendingTransferCaption", () => {
  const tMock = jest.fn((key, options) => {
    if (key === "timeUnits.seconds") {
      return "seconds";
    }
    if (key === "timeUnits.minutes") {
      return "minutes";
    }
    if (key === "timeUnits.hours") {
      return "hours";
    }
    if (key === "transfer.depositTakingLonger") {
      return "Deposit taking longer than expected";
    }
    if (key === "transfer.withdrawalTakingLonger") {
      return "Withdrawal taking longer than expected";
    }
    if (key === "transfer.amountToChain") {
      return `Transfer ${options.amount} to ${options.chain}`;
    }
    if (key === "transfer.amountFromChain") {
      return `Transfer ${options.amount} from ${options.chain}`;
    }
    if (key === "estimated") {
      return "Estimated";
    }
    if (key === "remaining") {
      return "remaining";
    }
    return key;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    (useTranslation as jest.Mock).mockReturnValue({ t: tMock });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the correct text for a withdraw", () => {
    render(
      <PendingTransferCaption
        isWithdraw={true}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={dayjs().add(5, "minutes").unix()}
      />
    );

    expect(screen.getByText("Transfer 10 OSMO to Osmosis")).toBeInTheDocument();
  });

  it("renders the correct text for a deposit", () => {
    render(
      <PendingTransferCaption
        isWithdraw={false}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={dayjs().add(5, "minutes").unix()}
      />
    );

    expect(
      screen.getByText("Transfer 10 OSMO from Osmosis")
    ).toBeInTheDocument();
  });

  it("updates the time remaining text for withdraw", () => {
    const estimatedArrivalUnix = dayjs().add(5, "minutes").unix();

    render(
      <PendingTransferCaption
        isWithdraw={true}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={estimatedArrivalUnix}
      />
    );

    jest.advanceTimersByTime(300000); // Advance time by 5 minutes

    expect(
      screen.getByText(/Withdrawal taking longer than expected/)
    ).toBeInTheDocument();
  });

  it("updates the time remaining text for deposit", () => {
    const estimatedArrivalUnix = dayjs().add(5, "minutes").unix();

    render(
      <PendingTransferCaption
        isWithdraw={false}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={estimatedArrivalUnix}
      />
    );

    jest.advanceTimersByTime(300000); // Advance time by 5 minutes

    expect(
      screen.getByText(/Deposit taking longer than expected/)
    ).toBeInTheDocument();
  });

  it("displays the hours and minutes", () => {
    const estimatedArrivalUnix = dayjs()
      .add(3, "hours")
      .add(59, "minutes")
      .unix();

    render(
      <PendingTransferCaption
        isWithdraw={true}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={estimatedArrivalUnix}
      />
    );

    expect(
      screen.getByText(/Estimated 3 hours and 58 minutes remaining/)
    ).toBeInTheDocument();
  });
});

describe("TransferHistoryStore multi-tx entries", () => {
  const { TransferHistoryStore } = jest.requireActual("../transfer-history");

  const makeSnapshot = (overrides: object = {}) => ({
    direction: "deposit" as const,
    createdAtUnix: 1700000000,
    type: "bridge-transfer" as const,
    provider: "Skip",
    fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
    toAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
    osmoBech32Address: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
    fromAsset: {
      denom: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      amount: "1000000000",
    },
    toAsset: {
      denom: "USDC",
      address:
        "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC",
      decimals: 6,
      amount: "999960000",
    },
    status: "pending" as const,
    sendTxHash: "0xtx1",
    fromChain: {
      chainId: 42161,
      chainType: "evm" as const,
      prettyName: "Arbitrum",
    },
    toChain: {
      chainId: "osmosis-1",
      chainType: "cosmos" as const,
      prettyName: "Osmosis",
    },
    estimatedArrivalUnix: 1700000600,
    ...overrides,
  });

  const pendingStep = {
    chainId: "noble-1",
    prettyName: "Noble",
    stepIndex: 2,
    totalSteps: 2,
    priorStepTxHash: "0xtx1",
  };

  const makeStore = (onTransferSuccess: jest.Mock = jest.fn()) => {
    const kvStore = {
      get: jest.fn().mockResolvedValue([]),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const statusProvider = {
      providerId: "Skip",
      trackTxStatus: jest.fn(),
      makeExplorerUrl: jest.fn().mockReturnValue(""),
    };
    const store = new TransferHistoryStore(
      onTransferSuccess,
      kvStore,
      [statusProvider],
      3
    );
    return { store, statusProvider, kvStore };
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not hand mid-flow multi-tx entries to the status provider", () => {
    const { store, statusProvider } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    expect(statusProvider.trackTxStatus).not.toHaveBeenCalled();

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xsingle" }));
    expect(statusProvider.trackTxStatus).toHaveBeenCalledTimes(1);
    expect(statusProvider.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ sendTxHash: "0xsingle" })
    );
  });

  it("advanceMultiTxStep clears the pending step and tracks on the intermediate chain", () => {
    const { store, statusProvider } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    store.advanceMultiTxStep("0xtx1", {
      finalSendTxHash: "COSMOS_TX_2",
      trackingChainId: "noble-1",
      estimatedArrivalUnix: 1700000700,
    });

    expect(statusProvider.trackTxStatus).toHaveBeenCalledTimes(1);
    expect(statusProvider.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        sendTxHash: "COSMOS_TX_2",
        trackingChainId: "noble-1",
        pendingStep: undefined,
        status: "pending",
      })
    );
  });

  it("markPendingStepStale keeps the entry unresolved and out of tracking", () => {
    // A stale step (expected funds gone from the intermediate account) must
    // neither be signable again nor hand the entry to first-leg tracking:
    // tx1 success only proves arrival on the intermediate chain, so
    // tracking it would report a completed deposit that may never have
    // reached the destination.
    const { store, statusProvider } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    store.markPendingStepStale("0xtx1");

    const snapshot = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.sendTxHash === "0xtx1");
    expect(snapshot?.pendingStep?.stale).toBe(true);
    expect(snapshot?.status).toBe("pending");
    expect(statusProvider.trackTxStatus).not.toHaveBeenCalled();
  });

  it("syncPendingStepFromStorage mirrors an advance made by another session", async () => {
    // The persisted history is the cross-session replay guard: when another
    // session already signed the final step (persisting the advanced
    // entry), a stale session's resume must observe that, update its own
    // entry, and refuse to sign again.
    const { store, statusProvider, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    // what the OTHER session persisted after broadcasting tx2
    kvStore.get.mockResolvedValue([
      makeSnapshot({
        sendTxHash: "COSMOS_TX_2",
        firstStepTxHash: "0xtx1",
        trackingChainId: "noble-1",
        pendingStep: undefined,
      }),
    ]);

    const result = await store.syncPendingStepFromStorage("0xtx1");

    expect(result).toBe("advanced");
    const snapshot = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.sendTxHash === "COSMOS_TX_2");
    expect(snapshot?.pendingStep).toBeUndefined();
    expect(statusProvider.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ sendTxHash: "COSMOS_TX_2" })
    );
  });

  it("persistNow never regresses an entry another session advanced", async () => {
    // Full-array persistence from a session with a stale in-memory copy
    // must not clobber the advanced entry another session wrote at
    // final-step broadcast.
    const { store, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    // what the OTHER session persisted after signing the final step
    kvStore.get.mockResolvedValue([
      makeSnapshot({
        sendTxHash: "COSMOS_TX_2",
        firstStepTxHash: "0xtx1",
        trackingChainId: "noble-1",
        pendingStep: undefined,
      }),
    ]);

    await store.persistNow();

    const written = kvStore.set.mock.calls.at(-1)?.[1] as TxSnapshot[];
    const entry = written.find(
      (s: TxSnapshot) => (s.firstStepTxHash ?? s.sendTxHash) === "0xtx1"
    );
    expect(entry?.sendTxHash).toBe("COSMOS_TX_2");
    expect(entry?.pendingStep).toBeUndefined();
  });

  it("persistNow keeps entries that exist only in storage", async () => {
    // A tab opened before another tab started a transfer must not erase
    // that transfer's entry when it later persists its own (stale, full)
    // array.
    const { store, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xmine" }));
    const otherTabsEntry = makeSnapshot({
      sendTxHash: "0xtheirs",
      firstStepTxHash: "0xtheirs",
      // fresh enough to be within the expiry window
      createdAtUnix: dayjs().unix(),
      pendingStep,
    });
    kvStore.get.mockResolvedValue([otherTabsEntry]);

    await store.persistNow();

    const written = kvStore.set.mock.calls.at(-1)?.[1] as TxSnapshot[];
    expect(written.some((s: TxSnapshot) => s.sendTxHash === "0xtheirs")).toBe(
      true
    );
    expect(written.some((s: TxSnapshot) => s.sendTxHash === "0xmine")).toBe(
      true
    );
  });

  it("syncPendingStepFromStorage leaves an unadvanced entry resumable", async () => {
    const { store, statusProvider, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    kvStore.get.mockResolvedValue([
      makeSnapshot({ pendingStep, firstStepTxHash: "0xtx1" }),
    ]);

    const result = await store.syncPendingStepFromStorage("0xtx1");

    expect(result).toBe("resumable");
    expect(statusProvider.trackTxStatus).not.toHaveBeenCalled();
  });

  it("restores the pending step when the advanced final step fails", async () => {
    // A failed FINAL step leaves the funds on the intermediate chain (an
    // on-chain failure moved nothing; a timed-out transfer refunds there),
    // so the entry must offer Continue again instead of turning into a
    // dead "failed" row.
    const { store, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    store.advanceMultiTxStep("0xtx1", {
      finalSendTxHash: "COSMOS_TX_2",
      trackingChainId: "noble-1",
      estimatedArrivalUnix: 1700000700,
    });
    await store.receiveNewTxStatus("COSMOS_TX_2", "failed", undefined);

    const snapshot = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.firstStepTxHash === "0xtx1");
    expect(snapshot?.status).toBe("pending");
    expect(snapshot?.pendingStep?.priorStepTxHash).toBe("0xtx1");
    expect(snapshot?.advancedStep).toBeUndefined();
    // the restore is made durable immediately so other sessions' storage
    // checks can't mistake it for an already-advanced entry
    expect(kvStore.set).toHaveBeenCalled();

    // ...and a retry can advance the restored entry again, keyed on the
    // immutable first-step hash (sendTxHash is still the failed attempt's)
    store.advanceMultiTxStep("0xtx1", {
      finalSendTxHash: "COSMOS_TX_3",
      trackingChainId: "noble-1",
      estimatedArrivalUnix: 1700000900,
    });
    // snapshots are immutable: re-read the entry after the advance
    const advanced = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.firstStepTxHash === "0xtx1");
    expect(advanced?.sendTxHash).toBe("COSMOS_TX_3");
    expect(advanced?.pendingStep).toBeUndefined();
  });

  it("ignores duplicate failed callbacks after a restore", async () => {
    // Status providers can deliver the same terminal status more than once;
    // a late duplicate for the failed attempt's hash must not clobber the
    // pending step the restore just put back.
    const { store } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    store.advanceMultiTxStep("0xtx1", {
      finalSendTxHash: "COSMOS_TX_2",
      trackingChainId: "noble-1",
      estimatedArrivalUnix: 1700000700,
    });
    await store.receiveNewTxStatus("COSMOS_TX_2", "failed", undefined);
    await store.receiveNewTxStatus("COSMOS_TX_2", "failed", undefined);

    const snapshot = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.firstStepTxHash === "0xtx1");
    expect(snapshot?.status).toBe("pending");
    expect(snapshot?.pendingStep?.priorStepTxHash).toBe("0xtx1");
  });

  it("keeps a failed FIRST step terminal", async () => {
    // Before the entry advances there is nothing to restore: a failed first
    // transaction means no funds reached the intermediate chain.
    const { store } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    await store.receiveNewTxStatus("0xtx1", "failed", undefined);

    const snapshot = (
      store as unknown as { snapshots: TxSnapshot[] }
    ).snapshots.find((s: TxSnapshot) => s.sendTxHash === "0xtx1");
    expect(snapshot?.status).toBe("failed");
    expect(snapshot?.pendingStep).toBeDefined(); // leftover, but no Continue: row is not pending
  });

  it("persistNow keeps a restored step over the stored advanced copy", async () => {
    // The step version orders advance vs restore: a restored entry (version
    // 2) must win the merge against the stored advanced copy (version 1),
    // even though "no pendingStep" normally reads as further along.
    const { store, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ pendingStep }));
    store.advanceMultiTxStep("0xtx1", {
      finalSendTxHash: "COSMOS_TX_2",
      trackingChainId: "noble-1",
      estimatedArrivalUnix: 1700000700,
    });
    // what THIS session persisted at advance
    kvStore.get.mockResolvedValue([
      makeSnapshot({
        sendTxHash: "COSMOS_TX_2",
        firstStepTxHash: "0xtx1",
        trackingChainId: "noble-1",
        pendingStep: undefined,
        multiTxStepVersion: 1,
      }),
    ]);
    await store.receiveNewTxStatus("COSMOS_TX_2", "failed", undefined);

    const written = kvStore.set.mock.calls.at(-1)?.[1] as TxSnapshot[];
    const entry = written.find(
      (s: TxSnapshot) => (s.firstStepTxHash ?? s.sendTxHash) === "0xtx1"
    );
    expect(entry?.pendingStep?.priorStepTxHash).toBe("0xtx1");
    expect(entry?.multiTxStepVersion).toBe(2);
  });

  it("expires an unresolved mid-flow entry only after the long stop", async () => {
    // Unresolved mid-flow entries outlive the normal expiry (Continue is
    // the recovery path for funds on the intermediate chain), but not
    // forever: a first tx that never landed must not leave an immortal row.
    const { store, kvStore } = makeStore();

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xmine" }));
    const midFlow = (createdAtUnix: number, hash: string) =>
      makeSnapshot({
        sendTxHash: hash,
        firstStepTxHash: hash,
        createdAtUnix,
        pendingStep,
      });
    kvStore.get.mockResolvedValue([
      midFlow(dayjs().subtract(29, "day").unix(), "0xrecoverable"),
      midFlow(dayjs().subtract(31, "day").unix(), "0xancient"),
    ]);

    await store.persistNow();

    const written = kvStore.set.mock.calls.at(-1)?.[1] as TxSnapshot[];
    expect(
      written.some((s: TxSnapshot) => s.sendTxHash === "0xrecoverable")
    ).toBe(true);
    expect(written.some((s: TxSnapshot) => s.sendTxHash === "0xancient")).toBe(
      false
    );
  });

  it("loads entries persisted in the legacy format and resumes tracking", async () => {
    // The persisted value under "transfer_history" is a bare TxSnapshot[]
    // (no wrapper); pending transfers written by the MobX-era store must
    // load, be tracked again, and expired ones must be pruned.
    const kvStore = {
      get: jest.fn().mockResolvedValue([
        makeSnapshot({
          sendTxHash: "0xpending",
          createdAtUnix: dayjs().unix(),
        }),
        makeSnapshot({
          sendTxHash: "0xdone",
          status: "success",
          createdAtUnix: dayjs().unix(),
        }),
        makeSnapshot({ sendTxHash: "0xexpired" }),
      ]),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const statusProvider = {
      providerId: "Skip",
      trackTxStatus: jest.fn(),
      makeExplorerUrl: jest.fn().mockReturnValue(""),
    };
    const store = new TransferHistoryStore(
      jest.fn(),
      kvStore,
      [statusProvider],
      3
    );

    await jest.advanceTimersByTimeAsync(0);

    expect(kvStore.get).toHaveBeenCalledWith("transfer_history");
    expect(store.snapshots.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xpending",
      "0xdone",
    ]);
    expect(statusProvider.trackTxStatus).toHaveBeenCalledTimes(1);
    expect(statusProvider.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ sendTxHash: "0xpending" })
    );
    // restore flips the flag, which writes the pruned list back as a bare array
    const [key, written] = kvStore.set.mock.calls.at(-1)!;
    expect(key).toBe("transfer_history");
    expect(Array.isArray(written)).toBe(true);
    expect(written.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xpending",
      "0xdone",
    ]);
  });

  it("persists pushed entries as a bare TxSnapshot[]", async () => {
    const { store, kvStore } = makeStore();
    await jest.advanceTimersByTimeAsync(0);

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xnew" }));
    await jest.advanceTimersByTimeAsync(0);

    const [key, written] = kvStore.set.mock.calls.at(-1)!;
    expect(key).toBe("transfer_history");
    expect(written).toEqual([expect.objectContaining({ sendTxHash: "0xnew" })]);
  });

  it("applies provider status updates and calls onFulfill callback once on success", async () => {
    const onTransferSuccess = jest.fn();
    const { store, statusProvider } = makeStore(onTransferSuccess);

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xsingle" }));
    // the provider is wired as the status delegate
    expect(statusProvider).toHaveProperty("statusReceiverDelegate", store);

    await store.receiveNewTxStatus("0xsingle", "pending", undefined);
    expect(onTransferSuccess).not.toHaveBeenCalled();

    await store.receiveNewTxStatus("0xsingle", "success", undefined);
    // duplicate terminal delivery must not re-fire
    await store.receiveNewTxStatus("0xsingle", "success", undefined);

    expect(store.snapshots[0].status).toBe("success");
    expect(onTransferSuccess).toHaveBeenCalledTimes(1);
    expect(onTransferSuccess).toHaveBeenCalledWith(
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx"
    );
  });

  it("records failure reasons and exposes entries per account", async () => {
    const { store } = makeStore();

    store.pushTxNow(makeSnapshot({ sendTxHash: "0xsingle" }));
    await store.receiveNewTxStatus("0xsingle", "failed", "insufficientFee");

    const rows = store.getHistoriesByAccount(
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("failed");
    expect(rows[0].reason).toBe("insufficientFee");
    expect(store.getHistoriesByAccount("osmo1other")).toHaveLength(0);
  });

  it("does not touch storage when disabled (server)", () => {
    const kvStore = { get: jest.fn(), set: jest.fn() };
    const store = new TransferHistoryStore(jest.fn(), kvStore, [], 3, false);
    store.pushTxNow(makeSnapshot());
    expect(kvStore.get).not.toHaveBeenCalled();
    expect(kvStore.set).not.toHaveBeenCalled();
  });

  it("sync applies the advance even if the entry was replaced during the storage read", async () => {
    // syncPendingStepFromStorage awaits storage; a concurrent update (here a
    // stale-mark from another resume path) replaces the entry object in the
    // meantime. The advance must land on the CURRENT entry, tracking must
    // start from the object actually stored, and the provider's status
    // callback must then resolve the row.
    const onTransferSuccess = jest.fn();
    const { store, statusProvider, kvStore } = makeStore(onTransferSuccess);
    store.pushTxNow(makeSnapshot({ pendingStep }));

    let release: (v: unknown[]) => void = () => {};
    kvStore.get.mockReturnValue(
      new Promise<unknown[]>((resolve) => (release = resolve))
    );
    const syncing = store.syncPendingStepFromStorage("0xtx1");

    store.markPendingStepStale("0xtx1"); // replaces the entry mid-await
    release([
      makeSnapshot({
        sendTxHash: "COSMOS_TX_2",
        firstStepTxHash: "0xtx1",
        trackingChainId: "noble-1",
        pendingStep: undefined,
      }),
    ]);

    expect(await syncing).toBe("advanced");
    const entry = store.snapshots.find(
      (s: TxSnapshot) => s.firstStepTxHash === "0xtx1"
    );
    expect(entry?.sendTxHash).toBe("COSMOS_TX_2");
    expect(entry?.pendingStep).toBeUndefined();
    expect(statusProvider.trackTxStatus).toHaveBeenCalledTimes(1);

    await store.receiveNewTxStatus("COSMOS_TX_2", "success", undefined);
    expect(
      store.snapshots.find((s: TxSnapshot) => s.firstStepTxHash === "0xtx1")
        ?.status
    ).toBe("success");
    expect(onTransferSuccess).toHaveBeenCalledTimes(1);
  });

  it("sync reports missing when the entry disappeared during the read", async () => {
    const kvStore = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const store = new TransferHistoryStore(jest.fn(), kvStore, [], 3, false);
    store.pushTxNow(makeSnapshot({ pendingStep, provider: "IBC" }));
    kvStore.get.mockImplementation(async () => {
      store.store.setState({ snapshots: [] });
      return [];
    });
    expect(await store.syncPendingStepFromStorage("0xtx1")).toBe("missing");
  });

  it("replays a success that arrived before the callback was bound, once", async () => {
    const store = new TransferHistoryStore(
      undefined,
      { get: jest.fn().mockResolvedValue([]), set: jest.fn() },
      [{ providerId: "Skip", trackTxStatus: jest.fn() }],
      3
    );
    store.pushTxNow(makeSnapshot({ sendTxHash: "0xsingle" }));
    await store.receiveNewTxStatus("0xsingle", "success", undefined);

    const callback = jest.fn();
    store.setOnAccountTransferSuccess(callback);
    store.setOnAccountTransferSuccess(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx"
    );
  });
});

describe("TransferHistoryStore.importSnapshots", () => {
  const { TransferHistoryStore, transferKey } = jest.requireActual(
    "../transfer-history"
  );
  const { displayToast } = jest.requireMock("~/components/alert/toast");

  const account = "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx";
  const usdcOnOsmosis =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const nowUnix = () => Math.floor(Date.now() / 1000);

  const makeIndexed = (overrides: Partial<TxSnapshot> = {}): TxSnapshot =>
    ({
      type: "bridge-transfer",
      direction: "withdraw",
      provider: "Squid",
      statusProvider: "Skip",
      createdAtUnix: nowUnix() - 60,
      estimatedArrivalUnix: nowUnix() - 60,
      sendTxHash: "OSMOHASH1",
      status: "pending",
      fromAddress: account,
      toAddress: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
      osmoBech32Address: account,
      fromChain: {
        chainType: "cosmos",
        chainId: "osmosis-1",
        prettyName: "Osmosis",
      },
      toChain: { chainType: "evm", chainId: 8453, prettyName: "Base" },
      fromAsset: {
        denom: "USDC",
        address: usdcOnOsmosis,
        decimals: 6,
        amount: "1000000",
      },
      toAsset: { denom: "USDC", address: usdcOnOsmosis, decimals: 6 },
      ...overrides,
    }) as TxSnapshot;

  const makeStore = (stored: TxSnapshot[] = []) => {
    const onTransferSuccess = jest.fn();
    const kvStore = {
      get: jest.fn().mockResolvedValue(stored),
      set: jest.fn().mockResolvedValue(undefined),
    };
    const provider = (providerId: string) => ({
      providerId,
      trackTxStatus: jest.fn(),
      makeExplorerUrl: jest.fn().mockReturnValue(""),
    });
    const skip = provider("Skip");
    const squid = provider("Squid");
    const ibc = provider("IBC");
    const store = new TransferHistoryStore(
      onTransferSuccess,
      kvStore,
      [squid, skip, ibc],
      3
    );
    return { store, skip, squid, ibc, onTransferSuccess };
  };

  const untilRestored = async (store: {
    store: { getState: () => { isRestoredFromIndexedDB: boolean } };
  }) => {
    while (!store.store.getState().isRestoredFromIndexedDB) {
      await Promise.resolve();
    }
  };

  beforeEach(() => {
    (displayToast as jest.Mock).mockClear();
  });

  it("adds indexed transfers once and lists them for the account", async () => {
    const { store } = makeStore();
    await untilRestored(store);

    store.importSnapshots([makeIndexed()]);
    store.importSnapshots([makeIndexed()]);

    const rows = store.getHistoriesByAccount(account);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ sendTxHash: "OSMOHASH1", imported: true });
  });

  it("skips transfers already in local history by tx hash", async () => {
    const local = makeIndexed({ provider: "Skip", statusProvider: undefined });
    const { store } = makeStore([local]);
    await untilRestored(store);

    store.importSnapshots([makeIndexed()]);

    expect(store.snapshots).toHaveLength(1);
    expect(store.snapshots[0].imported).toBeUndefined();
  });

  it("waits for stored history before deduping", async () => {
    const local = makeIndexed({ provider: "Skip", statusProvider: undefined });
    const { store } = makeStore([local]);

    store.importSnapshots([makeIndexed()]);
    await untilRestored(store);

    expect(store.snapshots).toHaveLength(1);
  });

  it("tracks recent withdrawals with the status provider, not the display provider", async () => {
    const { store, skip, squid } = makeStore();
    await untilRestored(store);

    store.importSnapshots([makeIndexed()]);

    expect(skip.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ sendTxHash: "OSMOHASH1" })
    );
    expect(squid.trackTxStatus).not.toHaveBeenCalled();
  });

  it("refreshes details of imported transfers, keeping their status", async () => {
    const { store } = makeStore();
    await untilRestored(store);

    store.importSnapshots([
      makeIndexed({ toAddress: "0xBeB12d8861765c850E8426Cc5c6a5207222f2477" }),
    ]);
    await store.receiveNewTxStatus("OSMOHASH1", "success", undefined);

    store.importSnapshots([
      makeIndexed({ toAddress: "0x1678ac809e0a5F6B3EDab7dc7099c74ee570d7fd" }),
    ]);

    expect(store.snapshots).toHaveLength(1);
    expect(store.snapshots[0]).toMatchObject({
      toAddress: "0x1678ac809e0a5F6B3EDab7dc7099c74ee570d7fd",
      status: "success",
      imported: true,
    });
  });

  it("tracks old pending withdrawals rather than assuming delivery", async () => {
    const { store, skip } = makeStore();
    await untilRestored(store);

    store.importSnapshots([
      makeIndexed({ createdAtUnix: nowUnix() - 30 * 24 * 60 * 60 }),
    ]);

    expect(store.snapshots[0].status).toBe("pending");
    expect(skip.trackTxStatus).toHaveBeenCalledWith(
      expect.objectContaining({ sendTxHash: "OSMOHASH1" })
    );
  });

  it("keeps a resolved sender and link when a refresh lacks them", async () => {
    const { store } = makeStore();
    await untilRestored(store);
    const deposit = (fromAddress: string, explorerUrl?: string) =>
      makeIndexed({
        direction: "deposit",
        status: "success",
        statusProvider: undefined,
        fromAddress,
        explorerUrl,
      });

    store.importSnapshots([
      deposit(
        "0xc8E4D1e39819d9C11B860356Ba5eF1100aB3A487",
        "https://axelarscan.io/gmp/0xsource"
      ),
    ]);
    // e.g. the Axelarscan lookup timed out this time
    store.importSnapshots([deposit("")]);

    expect(store.snapshots[0]).toMatchObject({
      fromAddress: "0xc8E4D1e39819d9C11B860356Ba5eF1100aB3A487",
      explorerUrl: "https://axelarscan.io/gmp/0xsource",
    });
  });

  it("takes a final status the server resolved for a pending import", async () => {
    const { store } = makeStore();
    await untilRestored(store);

    store.importSnapshots([makeIndexed()]);
    store.importSnapshots([makeIndexed({ status: "success" })]);
    // a late provider update must not overwrite it
    await store.receiveNewTxStatus("OSMOHASH1", "failed", undefined);

    expect(store.snapshots[0].status).toBe("success");
  });

  it("updates imported transfers silently", async () => {
    const { store, onTransferSuccess } = makeStore();
    await untilRestored(store);

    store.importSnapshots([makeIndexed()]);
    await store.receiveNewTxStatus("OSMOHASH1", "success", undefined);

    expect(store.snapshots[0].status).toBe("success");
    expect(displayToast).not.toHaveBeenCalled();
    expect(onTransferSuccess).not.toHaveBeenCalled();

    // a transfer made in this browser still toasts
    store.pushTxNow(
      makeIndexed({ sendTxHash: "LOCAL", statusProvider: undefined })
    );
    await store.receiveNewTxStatus("LOCAL", "success", undefined);
    expect(displayToast).toHaveBeenCalled();
  });

  it("matches an indexed arrival to a deposit made in this browser", async () => {
    const createdAtUnix = nowUnix() - 3000;
    const localDeposit = makeIndexed({
      direction: "deposit",
      provider: "Skip",
      statusProvider: undefined,
      sendTxHash: "0xevmhash",
      createdAtUnix,
      estimatedArrivalUnix: createdAtUnix + 600,
      status: "success",
    });
    const { store } = makeStore([localDeposit]);
    await untilRestored(store);

    const arrival = (sendTxHash: string, arrivedAtUnix: number) =>
      makeIndexed({
        direction: "deposit",
        provider: "IBC",
        statusProvider: undefined,
        status: "success",
        sendTxHash,
        createdAtUnix: arrivedAtUnix,
      });

    store.importSnapshots([
      // within the local deposit's arrival window: the same transfer
      arrival("RECV1", createdAtUnix + 300),
      // a second arrival of the same asset can't be the same deposit
      arrival("RECV2", createdAtUnix + 400),
      // before the local deposit was made: unrelated
      arrival("RECV3", createdAtUnix - 300),
    ]);

    expect(store.snapshots.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xevmhash",
      "RECV2",
      "RECV3",
    ]);
  });

  it("matches an arrival converted into another asset on Osmosis by amount", async () => {
    const createdAtUnix = nowUnix() - 3000;
    const alloyedUsdc =
      "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
    const localDeposit = makeIndexed({
      direction: "deposit",
      provider: "Skip",
      statusProvider: undefined,
      sendTxHash: "0xevmhash",
      createdAtUnix,
      estimatedArrivalUnix: createdAtUnix + 600,
      status: "success",
      toAsset: {
        denom: "USDC",
        address: alloyedUsdc,
        decimals: 6,
        amount: "999960000",
      },
    });
    const { store } = makeStore([localDeposit]);
    await untilRestored(store);

    const arrival = (sendTxHash: string, amount: string) =>
      makeIndexed({
        direction: "deposit",
        provider: "IBC",
        statusProvider: undefined,
        status: "success",
        sendTxHash,
        createdAtUnix: createdAtUnix + 300,
        fromAsset: {
          denom: "USDC",
          address: usdcOnOsmosis,
          decimals: 6,
          amount,
        },
        toAsset: {
          denom: "USDC",
          address: usdcOnOsmosis,
          decimals: 6,
          amount,
          alloy: alloyedUsdc,
        },
      });

    // a different amount of a different asset is another transfer
    store.importSnapshots([arrival("OTHER", "5000000")]);
    // the alloy conversion's arrival is the local deposit
    store.importSnapshots([arrival("CONVERTED", "999950000")]);

    expect(store.snapshots.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xevmhash",
      "OTHER",
    ]);
  });

  it("doesn't match an arrival of the same asset in another amount, or to a failed deposit", async () => {
    const createdAtUnix = nowUnix() - 3000;
    const localDeposit = (sendTxHash: string, status: TxSnapshot["status"]) =>
      makeIndexed({
        direction: "deposit",
        provider: "Skip",
        statusProvider: undefined,
        sendTxHash,
        createdAtUnix,
        estimatedArrivalUnix: createdAtUnix + 600,
        status,
        // 10 USDC sent from the source chain
        fromAsset: {
          denom: "USDC",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          decimals: 6,
          amount: "10000000",
        },
      });
    const { store } = makeStore([localDeposit("0xfailed", "failed")]);
    await untilRestored(store);

    const arrival = (sendTxHash: string, amount: string) =>
      makeIndexed({
        direction: "deposit",
        provider: "IBC",
        statusProvider: undefined,
        status: "success",
        sendTxHash,
        createdAtUnix: createdAtUnix + 300,
        fromAsset: {
          denom: "USDC",
          address: usdcOnOsmosis,
          decimals: 6,
          amount,
        },
        toAsset: { denom: "USDC", address: usdcOnOsmosis, decimals: 6, amount },
      });

    // the failed deposit's funds never arrived
    store.importSnapshots([arrival("AFTERFAILED", "9950000")]);
    store.pushTxNow(localDeposit("0xpending", "pending"));
    // 1,000 USDC from elsewhere isn't the pending 10 USDC deposit
    store.importSnapshots([arrival("UNRELATED", "1000000000")]);
    // 9.95 USDC after bridge fees is
    store.importSnapshots([arrival("ARRIVAL", "9950000")]);

    expect(store.snapshots.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xfailed",
      "AFTERFAILED",
      "0xpending",
      "UNRELATED",
    ]);
  });

  it("doesn't match an arrival of another asset by amount alone", async () => {
    const createdAtUnix = nowUnix() - 600;
    const localDeposit = makeIndexed({
      direction: "deposit",
      provider: "Skip",
      statusProvider: undefined,
      sendTxHash: "0xevmhash",
      createdAtUnix,
      estimatedArrivalUnix: createdAtUnix + 600,
      status: "pending",
      toAsset: {
        denom: "USDC",
        address: usdcOnOsmosis,
        decimals: 6,
        amount: "100000000",
      },
    });
    const { store } = makeStore([localDeposit]);
    await untilRestored(store);

    // 99 ATOM two minutes later: same precision, within 2% of the amount
    const atom = {
      denom: "ATOM",
      address:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      decimals: 6,
      amount: "99000000",
    };
    store.importSnapshots([
      makeIndexed({
        direction: "deposit",
        provider: "IBC",
        statusProvider: undefined,
        status: "success",
        sendTxHash: "ATOMRECV",
        createdAtUnix: createdAtUnix + 120,
        fromAsset: atom,
        toAsset: atom,
      }),
    ]);

    expect(store.snapshots.map((s: TxSnapshot) => s.sendTxHash)).toEqual([
      "0xevmhash",
      "ATOMRECV",
    ]);
  });

  describe("deposits delivered in one relayer tx", () => {
    const deposit = (packetId: string | undefined, amount: string) =>
      makeIndexed({
        direction: "deposit",
        provider: "IBC",
        statusProvider: undefined,
        status: "success",
        sendTxHash: "RELAYERTX",
        packetId,
        fromAsset: {
          denom: "USDC",
          address: usdcOnOsmosis,
          decimals: 6,
          amount,
        },
      });

    it("keeps one entry per packet", async () => {
      const { store } = makeStore();
      await untilRestored(store);

      store.importSnapshots([
        deposit("channel-208/1", "1000000"),
        deposit("channel-208/2", "2000000"),
      ]);
      store.importSnapshots([deposit("channel-208/2", "2000000")]);

      expect(
        store.getHistoriesByAccount(account).map(transferKey).sort()
      ).toEqual(["RELAYERTX/channel-208/1", "RELAYERTX/channel-208/2"]);
    });

    it("replaces an entry imported before deposits had packets", async () => {
      // parsed from the tx's first packet, which may not be the user's
      const legacy = { ...deposit(undefined, "5"), imported: true };
      const { store } = makeStore([legacy]);
      await untilRestored(store);

      store.importSnapshots([
        deposit("channel-208/1", "1000000"),
        deposit("channel-208/2", "2000000"),
      ]);

      expect(
        store.snapshots.map((s: TxSnapshot) => [s.packetId, s.fromAsset.amount])
      ).toEqual([
        ["channel-208/1", "1000000"],
        ["channel-208/2", "2000000"],
      ]);
    });
  });

  describe("getIndexedHistories", () => {
    it("lists only the given transfers, with the status tracked here", async () => {
      const { store } = makeStore();
      await untilRestored(store);
      const page0 = [makeIndexed({ sendTxHash: "PAGE0" })];
      const page3 = [makeIndexed({ sendTxHash: "PAGE3" })];

      store.importSnapshots(page0);
      store.importSnapshots(page3);
      await store.receiveNewTxStatus("PAGE0", "success", undefined);

      // page 3's transfer doesn't leak onto page 0
      expect(store.getIndexedHistories(account, page0)).toEqual([
        expect.objectContaining({
          sendTxHash: "PAGE0",
          status: "success",
          imported: true,
        }),
      ]);
    });

    it("lists transfers not imported yet, or pruned since", async () => {
      const { store } = makeStore();
      await untilRestored(store);

      expect(store.getIndexedHistories(account, [makeIndexed()])).toMatchObject(
        [{ sendTxHash: "OSMOHASH1", imported: true }]
      );
    });

    it("leaves out transfers made in this browser", async () => {
      const local = makeIndexed({
        provider: "Skip",
        statusProvider: undefined,
      });
      const { store } = makeStore([local]);
      await untilRestored(store);

      expect(store.getIndexedHistories(account, [makeIndexed()])).toEqual([]);
    });
  });
});
