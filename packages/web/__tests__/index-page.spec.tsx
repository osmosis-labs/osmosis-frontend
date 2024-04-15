/* eslint-disable import/no-extraneous-dependencies */
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { screen } from "@testing-library/react";
import mockRouter from "next-router-mock";

import { AssetLists } from "~/config/generated/asset-lists";
import HomePage, { PreviousTrade, SwapPreviousTradeKey } from "~/pages";
import { renderWithProviders } from "~/tests/test-utils";

jest.mock("next/router", () => jest.requireActual("next-router-mock"));

const atomAsset = getAssetFromAssetList({
  assetLists: AssetLists,
  sourceDenom: "uatom",
})!;
const osmoAsset = getAssetFromAssetList({
  assetLists: AssetLists,
  coinMinimalDenom: "uosmo",
})!;
const usdcAsset = getAssetFromAssetList({
  symbol: "USDC",
  assetLists: AssetLists,
})!;
const usdtAsset = getAssetFromAssetList({
  symbol: "USDT",
  assetLists: AssetLists,
})!;

afterEach(() => {
  mockRouter.setCurrentUrl("/");
  localStorage.removeItem(SwapPreviousTradeKey);
});

it("should display initial tokens when there are no previous trades", () => {
  renderWithProviders(<HomePage />);
  expect(mockRouter).toMatchObject({
    pathname: "/",
    query: {
      from: atomAsset.symbol,
      to: osmoAsset.symbol,
    },
  });

  screen.getByRole("heading", { name: "Swap" });

  screen.getByRole("heading", { name: atomAsset.symbol });
  screen.getByText(atomAsset.rawAsset.name);

  screen.getByRole("heading", { name: osmoAsset.symbol });
  screen.getByText(osmoAsset.rawAsset.name);
});

it("If there's a previous trade, swap tool should select those tokens", () => {
  localStorage.setItem(
    SwapPreviousTradeKey,
    JSON.stringify({
      sendTokenDenom: usdtAsset.symbol,
      outTokenDenom: usdcAsset.symbol,
    } as PreviousTrade)
  );

  renderWithProviders(<HomePage />);

  expect(mockRouter).toMatchObject({
    pathname: "/",
    query: {
      from: usdtAsset.symbol,
      to: usdcAsset.symbol,
    },
  });

  screen.getByRole("heading", { name: "Swap" });

  screen.getByRole("heading", { name: usdtAsset.symbol });
  screen.getByText(usdtAsset.rawAsset.name);

  screen.getByRole("heading", { name: usdcAsset.symbol });
  screen.getByText(usdcAsset.rawAsset.name);
});

it.only("If the previous trade are not available, swap tool should select default tokens", () => {
  localStorage.setItem(
    SwapPreviousTradeKey,
    JSON.stringify({
      sendTokenDenom: "NOTEXIST",
      outTokenDenom: "MAYBEEXIST",
    } as PreviousTrade)
  );

  renderWithProviders(<HomePage />);

  expect(mockRouter).toMatchObject({
    pathname: "/",
    query: {
      from: atomAsset.symbol,
      to: osmoAsset.symbol,
    },
  });

  screen.getByRole("heading", { name: "Swap" });

  screen.getByRole("heading", { name: atomAsset.symbol });
  screen.getByText(atomAsset.rawAsset.name);

  screen.getByRole("heading", { name: osmoAsset.symbol });
  screen.getByText(osmoAsset.rawAsset.name);
});
