import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

import { useTranslation } from "~/hooks";

import { PendingTransferCaption } from "../transfer-history";

jest.mock("~/hooks", () => ({
  useTranslation: jest.fn(),
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
      address: "factory/osmo1alloy/alloyed/allUSDC",
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

  const makeStore = () => {
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
      jest.fn(),
      kvStore,
      [statusProvider],
      3
    );
    return { store, statusProvider };
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

    const snapshot = store.snapshots.find((s) => s.sendTxHash === "0xtx1");
    expect(snapshot?.pendingStep?.stale).toBe(true);
    expect(snapshot?.status).toBe("pending");
    expect(statusProvider.trackTxStatus).not.toHaveBeenCalled();
  });
});
