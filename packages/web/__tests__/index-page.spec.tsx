/* eslint-disable import/no-extraneous-dependencies */
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";

import { server, trpcMsw } from "~/__tests__/msw";
import { renderWithProviders } from "~/__tests__/test-utils";
import { AssetLists } from "~/config/generated/asset-lists";
import HomePage, { PreviousTrade, SwapPreviousTradeKey } from "~/pages";

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

beforeEach(() => {
  server.use(
    trpcMsw.edge.assets.getUserAssets.query((_req, res, ctx) => {
      return res(ctx.status(200), ctx.data({ items: [], nextCursor: null }));
    }),
    trpcMsw.edge.assets.getAssetPrice.query((_req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.data(new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)))
      );
    })
  );
});

it("should display initial tokens when there are no previous trades", async () => {
  renderWithProviders(<HomePage />);

  await screen.findByRole("heading", { name: "Swap" });

  expect(mockRouter).toMatchObject({
    pathname: "/",
    query: {
      from: atomAsset.symbol,
      to: osmoAsset.symbol,
    },
  });

  screen.getByRole("heading", { name: atomAsset.symbol });
  screen.getByText(atomAsset.rawAsset.name);

  screen.getByRole("heading", { name: osmoAsset.symbol });
  screen.getByText(osmoAsset.rawAsset.name);
});

it("If there's a previous trade and no query params, swap tool should select those tokens", async () => {
  localStorage.setItem(
    SwapPreviousTradeKey,
    JSON.stringify({
      sendTokenDenom: usdtAsset.symbol,
      outTokenDenom: usdcAsset.symbol,
    } as PreviousTrade)
  );

  renderWithProviders(<HomePage />);

  await screen.findByRole("heading", { name: "Swap" });

  expect(mockRouter).toMatchObject({
    pathname: "/",
    query: {
      from: usdtAsset.symbol,
      to: usdcAsset.symbol,
    },
  });

  screen.getByRole("heading", { name: usdtAsset.symbol });
  screen.getByText(usdtAsset.rawAsset.name);

  screen.getByRole("heading", { name: usdcAsset.symbol });
  screen.getByText(usdcAsset.rawAsset.name);
});

it("If the previous trade is not available, swap tool should select default tokens", async () => {
  localStorage.setItem(
    SwapPreviousTradeKey,
    JSON.stringify({
      sendTokenDenom: "NOTEXIST",
      outTokenDenom: "NOTEXIST2",
    } as PreviousTrade)
  );

  renderWithProviders(<HomePage />);

  await waitFor(() => {
    expect(mockRouter).toMatchObject({
      pathname: "/",
      query: {
        from: atomAsset.symbol,
        to: osmoAsset.symbol,
      },
    });
  });

  screen.getByRole("heading", { name: "Swap" });

  screen.getByRole("heading", { name: atomAsset.symbol });
  screen.getByText(atomAsset.rawAsset.name);

  screen.getByRole("heading", { name: osmoAsset.symbol });
  screen.getByText(osmoAsset.rawAsset.name);
});

it("If there's no previous trade and no query params, swap tool should select default tokens and can switch between them", async () => {
  renderWithProviders(<HomePage />);

  await waitFor(() => {
    expect(mockRouter).toMatchObject({
      pathname: "/",
      query: {
        from: atomAsset.symbol,
        to: osmoAsset.symbol,
      },
    });
  });

  screen.getByRole("heading", { name: "Swap" });

  screen.getByRole("heading", { name: atomAsset.symbol });
  screen.getByText(atomAsset.rawAsset.name);

  screen.getByRole("heading", { name: osmoAsset.symbol });
  screen.getByText(osmoAsset.rawAsset.name);

  // Switch assets
  await userEvent.click(screen.getByLabelText("Switch assets"));

  await waitFor(() => {
    expect(mockRouter).toMatchObject({
      pathname: "/",
      query: {
        from: osmoAsset.symbol,
        to: atomAsset.symbol,
      },
    });
  });
});
