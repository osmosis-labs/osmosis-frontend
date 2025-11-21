import * as core from "@actions/core";
import { type BrowserContext, expect, test } from "@playwright/test";
import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";

test.describe("Test Filled Limit Order feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const walletId = process.env.WALLET_ID ?? "wallet_id";
  let tradePage: TradePage;

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    // Check balances before running tests - warn only mode
    await ensureBalances(
      walletId,
      [
        { token: "OSMO", amount: 1.1 }, // For limit sell OSMO
        { token: "USDC", amount: 1.1 }, // For limit buy OSMO
      ],
      { warnOnly: true }
    );

    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
  });

  test.beforeEach(async () => {
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterEach(async () => {
    await tradePage.logOut();
  });

  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  test.afterEach(async ({}, testInfo) => {
    console.log(`Test [${testInfo.title}] status: ${testInfo.status}`);
    if (testInfo.status === "failed") {
      const name = testInfo.title;
      core.notice(`Test ${name} failed.`);
    }
  });

  test("User should be able to limit sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.08");
    await tradePage.setLimitPriceChange("Market");
    await tradePage.sellAndApprove(context);
    await tradePage.getTransactionUrl();
  });

  test("User should be able to limit buy OSMO", async () => {
    const PRICE_INCREASE_FACTOR = 1.07; // 7% increase for limit price
    const _ORDER_HISTORY_TIMEOUT = 30; // Seconds to wait for order history
    await tradePage.goto();
    await tradePage.openBuyTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.04");
    await tradePage.setLimitPriceChange("Market");
    const limitPrice = Number(await tradePage.getLimitPrice());
    const highLimitPrice = (limitPrice * PRICE_INCREASE_FACTOR).toFixed(4);
    await tradePage.setLimitPrice(String(highLimitPrice));
    await tradePage.buyAndApprove(context);
    await tradePage.getTransactionUrl();
    //await tradePage.gotoOrdersHistory(ORDER_HISTORY_TIMEOUT);
    //const p = context.pages()[0]
    //const trxPage = new TransactionsPage(p)
    //await trxPage.isFilledByLimitPrice(highLimitPrice)
  });
});
