import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import { render, screen } from "@testing-library/react";
import React from "react";

import { AssetsInfo } from "../expanded";

jest.mock("~/hooks", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AssetsInfo", () => {
  it("renders with assets and total value", () => {
    const assets = [
      new CoinPretty(
        { coinDenom: "ATOM", coinDecimals: 6, coinMinimalDenom: "uatom" },
        new Dec(100).mul(DecUtils.getTenExponentN(6))
      ),
      new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(200).mul(DecUtils.getTenExponentN(6))
      ),
      new CoinPretty(
        { coinDenom: "PEPE", coinDecimals: 6, coinMinimalDenom: "upepe" },
        new Dec(200.002).mul(DecUtils.getTenExponentN(6))
      ),
      new CoinPretty(
        { coinDenom: "USDC", coinDecimals: 6, coinMinimalDenom: "uusdc" },
        new Dec(200.02).mul(DecUtils.getTenExponentN(6))
      ),
    ];
    const totalValue = new PricePretty(DEFAULT_VS_CURRENCY, "300");

    render(
      <AssetsInfo
        title="Test Title"
        assets={assets}
        totalValue={totalValue}
        className="test-class"
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("100 ATOM")).toBeInTheDocument();
    expect(screen.getByText("200 OSMO")).toBeInTheDocument();
    expect(screen.getByText("200.002 PEPE")).toBeInTheDocument();
    expect(screen.getByText("200.02 USDC")).toBeInTheDocument();
    expect(screen.getByText("($300)")).toBeInTheDocument();
  });

  it("should handle assets with very small decimals", () => {
    const assets = [
      new CoinPretty(
        { coinDenom: "BTC", coinDecimals: 8, coinMinimalDenom: "sat" },
        new Dec(0.02123451).mul(DecUtils.getTenExponentN(8))
      ),
      new CoinPretty(
        { coinDenom: "BTC2", coinDecimals: 8, coinMinimalDenom: "sat" },
        new Dec(0.00000001).mul(DecUtils.getTenExponentN(8))
      ),
      new CoinPretty(
        { coinDenom: "BTC3", coinDecimals: 8, coinMinimalDenom: "sat" },
        new Dec(0.62345678).mul(DecUtils.getTenExponentN(8))
      ),
    ];
    const totalValue = new PricePretty(DEFAULT_VS_CURRENCY, "300");

    render(
      <AssetsInfo
        title="Test Title"
        assets={assets}
        totalValue={totalValue}
        className="test-class"
      />
    );

    expect(screen.getByText("0.021234 BTC")).toBeInTheDocument();
    expect(screen.getByText("0.00000001 BTC2")).toBeInTheDocument();
    expect(screen.getByText("0.623456 BTC3")).toBeInTheDocument();
    expect(screen.getByText("($300)")).toBeInTheDocument();
  });

  it("renders with empty text when no assets", () => {
    render(
      <AssetsInfo
        title="Test Title"
        assets={[]}
        emptyText="No assets available"
        className="test-class"
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(
      screen.getByText("clPositions.checkBackForRewards")
    ).toBeInTheDocument();
  });

  it("renders without total value when not provided", () => {
    const assets = [
      new CoinPretty(
        { coinDenom: "ATOM", coinDecimals: 6, coinMinimalDenom: "uatom" },
        "100"
      ),
    ];

    render(
      <AssetsInfo title="Test Title" assets={assets} className="test-class" />
    );

    expect(screen.queryByText("(100 USD)")).not.toBeInTheDocument();
  });
});
