import * as core from "@actions/core";
import { type BrowserContext, expect, test } from "@playwright/test";
import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";

test.describe("Test Market Buy/Sell Order feature", () => {
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
        { token: "USDC", amount: 3.2 }, // For market buy BTC and OSMO (1.55 each)
        { token: "BTC", amount: 1.6 }, // For market sell BTC
        { token: "OSMO", amount: 1.6 }, // For market sell OSMO
      ],
      { warnOnly: true }
    );

    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.waitForAssetsToLoad();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    await tradePage.connectWallet();
    await tradePage.waitForAssetsToLoad();
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

  // biome-ignore lint/complexity/noForEach: <explanation>
  [{ name: "BTC" }, { name: "OSMO" }].forEach(({ name }) => {
    test(`User should be able to Market Buy ${name}`, async () => {
      await tradePage.goto();
      await tradePage.waitForAssetsToLoad();
      await tradePage.openBuyTab();
      await tradePage.selectAsset(name);
      await tradePage.enterAmount("1.55");
      await tradePage.isSufficientBalanceForTrade();
      await tradePage.showSwapInfo();
      await tradePage.buyAndApprove(context, { slippagePercent: "3" });
      await tradePage.getTransactionUrl();
    });
  });

  // unwrapped market sell tests just in case this affects anything.
  test("User should be able to Market Sell BTC", async () => {
    await tradePage.goto();
    await tradePage.waitForAssetsToLoad();
    await tradePage.openSellTab();
    await tradePage.selectAsset("BTC");
    await tradePage.enterAmount("1.54");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    await tradePage.sellAndApprove(context, { slippagePercent: "3" });
    await tradePage.getTransactionUrl();
  });

  test("User should be able to Market Sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.waitForAssetsToLoad();
    await tradePage.openSellTab();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.54");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    await tradePage.sellAndApprove(context, { slippagePercent: "3" });
    await tradePage.getTransactionUrl();
  });
});
