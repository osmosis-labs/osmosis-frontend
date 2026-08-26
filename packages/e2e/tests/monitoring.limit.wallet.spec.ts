import * as core from "@actions/core";
import { type BrowserContext, expect, test } from "@playwright/test";
import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";
import { deriveAddress } from "../utils/wallet-utils";

test.describe("Test Filled Limit Order feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;

  // Prod rejects limit orders below $1 (NEXT_PUBLIC_LIMIT_ORDER_MIN_AMOUNT, enforced
  // in use-place-limit.ts) by disabling the trade button. Size just above the floor:
  // the check runs on a live fiat price, so an order sized at exactly $1 can round
  // under it. Market/swap legs are exempt from the minimum and stay smaller.
  const ORDER_AMOUNT = "1.10";

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    const { address } = await deriveAddress(privateKey);
    await ensureBalances(address, [
      // Sell-tab amounts are fiat-mode in prod (inGivenOut flag, see MTN-157
      // note in balance-config.ts), so both requirements are USD-denominated.
      { token: "OSMO", amount: 1.2, unit: "usd" }, // For limit sell OSMO ($1.10)
      { token: "USDC", amount: 1.15, unit: "usd" }, // For limit buy OSMO ($1.10)
    ]);

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
    await tradePage.enterAmount(ORDER_AMOUNT);
    await tradePage.setLimitPriceChange("Market");
    await tradePage.sellAndApprove(context);
    await tradePage.getTransactionUrl();
  });

  test("User should be able to limit buy OSMO", async () => {
    const PRICE_INCREASE_FACTOR = 1.07; // 7% increase for limit price
    await tradePage.goto();
    await tradePage.openBuyTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount(ORDER_AMOUNT);
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
