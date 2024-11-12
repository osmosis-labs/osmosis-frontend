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
    if (key === "transfer.amountToChain") {
      return `Transfer ${options.amount} to ${options.chain}`;
    }
    if (key === "transfer.amountFromChain") {
      return `Transfer ${options.amount} from ${options.chain}`;
    }
    if (key === "aboutSecondsRemaining") {
      return `About ${options.seconds} remaining`;
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

  it("updates the time remaining text", () => {
    const estimatedArrivalUnix = dayjs().add(5, "minutes").unix();

    render(
      <PendingTransferCaption
        isWithdraw={true}
        amount="10 OSMO"
        chainPrettyName="Osmosis"
        estimatedArrivalUnix={estimatedArrivalUnix}
      />
    );

    jest.advanceTimersByTime(296000); // Advance time by 4 minutes and 56 seconds

    expect(screen.getByText(/About 5 seconds remaining/)).toBeInTheDocument();
  });
});
