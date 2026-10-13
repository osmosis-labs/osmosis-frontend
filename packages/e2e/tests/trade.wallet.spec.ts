import { type BrowserContext, expect, test } from "@playwright/test";

import { TradePage } from "../pages/trade-page";
import { TransactionsPage } from "../pages/transactions-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";
import { getOrderbookBestBid, getSwapSellPrice } from "../utils/orderbook";
import { resolveAppUsdcDenom } from "../utils/usdc-identity";
import { deriveAddress } from "../utils/wallet-utils";

test.describe("Test Trade feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  // Resolved from the build under test in beforeAll: "USDC" is the alloy on
  // builds carrying the assetlist identity handover and Noble on builds that
  // predate it. Derived, not hardcoded, so the assertion follows whichever
  // identity the build's token selector reports and fails when the selector
  // and the swap route disagree. It does not prove the build carries the
  // handover — if the assetlist still says Noble, this expects Noble.
  let USDC: string;
  const ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

  test.beforeAll(async () => {
    USDC = await resolveAppUsdcDenom();
    context = await new SetupKeplr().setupWallet(privateKey);

    const { address } = await deriveAddress(privateKey);
    await ensureBalances(address, [
      { token: "USDC", amount: 1.12, unit: "usd" }, // Max needed for buy test
      { token: "ATOM", amount: 2.12, unit: "usd" }, // 1.11 + 1.01 for sell tests (fiat-mode → USD so it scales as price moves)
      { token: "OSMO", amount: 1.01, unit: "usd" }, // Max needed for limit sell OSMO test (fiat-mode → USD so it scales as price moves)
    ]);
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
  });

  test.afterAll(async () => {
    // beforeAll resolves the USDC identity before the wallet exists, and that
    // resolver throws by design, so context can still be undefined here.
    await context?.close();
  });

  test.beforeEach(async () => {
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterEach(async () => {
    await tradePage.logOut();
  });

  // The cancel tests need an ask that rests on the book, priced the way a user
  // would: with a preset. The preset is relative to the app's market price,
  // but that price can lag the pools, and the thin orderbooks can hold bids
  // above it. An ask at or below the best bid fills at placement, and an ask
  // below the swap sell price is filled within a block by an arbitrageur
  // selling into the pools. Either way nothing is left to cancel, so when the
  // preset lands near or under either price, reprice 10% above the higher one.
  const setAskAboveSellFloor = async (baseDenom: string, preset: string) => {
    const pair = {
      baseDenom,
      quoteDenom: USDC,
      baseExponent: 6,
      quoteExponent: 6,
    };
    const [bestBid, swapSellPrice] = await Promise.all([
      getOrderbookBestBid(pair),
      getSwapSellPrice({ ...pair, baseAmount: 1 }),
    ]);
    // The swap sell price is the floor the arbitrage keys off. Without it the
    // preset is the only price left, and that is the price that was sniped,
    // so fail rather than hand the wallet's funds to a bot.
    if (swapSellPrice === undefined) {
      throw new Error(
        `Could not read the swap sell price for ${baseDenom}; not placing an ask that could be filled at once.`
      );
    }
    const floorPrice = Math.max(bestBid ?? 0, swapSellPrice);
    await tradePage.setLimitPriceChange(preset);
    if (Number(await tradePage.getLimitPrice()) <= floorPrice * 1.02) {
      // 4 significant digits, matching how the app formats prices below 100.
      await tradePage.setLimitPrice(
        String(Number((floorPrice * 1.1).toPrecision(4)))
      );
    }
    return tradePage.getLimitPrice();
  };

  test("User should be able to Buy ATOM", async () => {
    await tradePage.goto();
    await tradePage.openBuyTab();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("1.12");
    const { msgContentAmount } = await tradePage.buyAndGetWalletMsg(context, {
      maxRetries: 2,
      slippagePercent: "3",
      prepareRetry: () => tradePage.enterAmount("1.12"),
    });
    // Only validate message content if Keplr popup appeared (not 1-click trading)
    if (msgContentAmount) {
      expect(msgContentAmount).toContain(`denom: ${ATOM}`);
      expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
      expect(msgContentAmount).toContain(`denom: ${USDC}`);
    }
    await tradePage.getTransactionUrl();
  });

  test("User should be able to Sell ATOM", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("1.11");
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context, {
      maxRetries: 2,
      slippagePercent: "3",
      prepareRetry: () => tradePage.enterAmount("1.11"),
    });
    // Only validate message content if Keplr popup appeared (not 1-click trading)
    if (msgContentAmount) {
      expect(msgContentAmount).toContain(`denom: ${USDC}`);
      expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
      expect(msgContentAmount).toContain(`denom: ${ATOM}`);
    }
    await tradePage.getTransactionUrl();
  });

  test("User should be able to limit sell ATOM", async () => {
    await tradePage.goto();
    const amount = "1.01";
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("ATOM");
    // A retry re-fills the form and re-reads the prices, since the market (and
    // so the preset, the book and the pools) can move between attempts.
    let limitPrice = "";
    const fillOrder = async () => {
      await tradePage.enterAmount(amount);
      limitPrice = await setAskAboveSellFloor(ATOM, "5%");
    };
    await fillOrder();
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context, {
      maxRetries: 2,
      limit: true,
      prepareRetry: fillOrder,
    });
    // Only validate message content if Keplr popup appeared (not 1-click trading)
    if (msgContentAmount) {
      //expect(msgContentAmount).toContain(amount + " ATOM (Cosmos Hub/channel-0)");
      expect(msgContentAmount).toContain("place_limit");
      expect(msgContentAmount).toContain('"order_direction": "ask"');
    }
    await tradePage.getTransactionUrl();
    await tradePage.gotoOrdersHistory();
    const trxPage = new TransactionsPage(context.pages()[0]);
    await trxPage.cancelLimitOrder(`Sell $${amount} of`, limitPrice, context);
    // Prefer the hash captured during the cancel: when REST confirms and the
    // success toast never renders, TradePage has no hash of its own to fall
    // back on and its toast-link lookup would fail the test.
    const cancelUrl = trxPage.getLastTxUrl();
    if (cancelUrl) {
      console.log(`Cancel trx url: ${cancelUrl}`);
    } else {
      await tradePage.getTransactionUrl();
    }
  });

  test("User should be able to cancel limit sell OSMO", async () => {
    await tradePage.goto();
    const amount = "1.01";
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    // A retry re-fills the form and re-reads the prices, since the market (and
    // so the preset, the book and the pools) can move between attempts.
    let limitPrice = "";
    const fillOrder = async () => {
      await tradePage.enterAmount(amount);
      limitPrice = await setAskAboveSellFloor("uosmo", "10%");
    };
    await fillOrder();
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context, {
      maxRetries: 2,
      limit: true,
      prepareRetry: fillOrder,
    });
    // Only validate message content if Keplr popup appeared (not 1-click trading)
    if (msgContentAmount) {
      //expect(msgContentAmount).toContain(`${amount} OSMO`);
      expect(msgContentAmount).toContain("place_limit");
      expect(msgContentAmount).toContain('"order_direction": "ask"');
    }
    await tradePage.getTransactionUrl();
    await tradePage.gotoOrdersHistory();
    const trxPage = new TransactionsPage(context.pages()[0]);
    await trxPage.cancelLimitOrder(`Sell $${amount} of`, limitPrice, context);
    // Prefer the hash captured during the cancel: when REST confirms and the
    // success toast never renders, TradePage has no hash of its own to fall
    // back on and its toast-link lookup would fail the test.
    const cancelUrl = trxPage.getLastTxUrl();
    if (cancelUrl) {
      console.log(`Cancel trx url: ${cancelUrl}`);
    } else {
      await tradePage.getTransactionUrl();
    }
  });
});
