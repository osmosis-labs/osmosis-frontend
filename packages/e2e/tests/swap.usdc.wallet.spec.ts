import * as core from "@actions/core";
import { type BrowserContext, expect, test } from "@playwright/test";
import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";

test.describe("Test Swap to/from USDC feature", () => {
  let context: BrowserContext;
  const _walletId =
    process.env.WALLET_ID ?? "osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const _USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const _ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
  const _TIA =
    "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877";
  const _INJ =
    "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273";
  const _AKT =
    "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4";

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    // Check balances before running tests - fail fast if insufficient
    await ensureBalances(
      _walletId,
      [
        { token: "USDC", amount: 0.5 }, // Total needed: 0.1 + 0.1 + 0.2 + 0.1 for swaps to other tokens
        { token: "ATOM", amount: 0.015 }, // Max needed in single test
        { token: "TIA", amount: 0.02 }, // Max needed in single test
        { token: "INJ", amount: 0.01 }, // Max needed in single test
        { token: "AKT", amount: 0.025 }, // Max needed in single test
      ],
      { warnOnly: true }
    );

    // Switch to Application
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await tradePage.logOut();
    await context.close();
  });

  test.beforeEach(async () => {
    await tradePage.goto();
  });

  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  test.afterEach(async ({}, testInfo) => {
    console.log(`Test [${testInfo.title}] status: ${testInfo.status}`);
    if (testInfo.status === "failed") {
      const name = testInfo.title;
      core.notice(`Test ${name} failed.`);
    }
  });

  test("User should be able to swap ATOM to USDC", async () => {
    await tradePage.selectPair("ATOM", "USDC");
    await tradePage.enterAmount("0.015");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap USDC to ATOM", async () => {
    await tradePage.selectPair("USDC", "ATOM");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap USDC to TIA", async () => {
    await tradePage.selectPair("USDC", "TIA");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap TIA to USDC", async () => {
    await tradePage.selectPair("TIA", "USDC");
    await tradePage.enterAmount("0.02");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap USDC to INJ", async () => {
    await tradePage.selectPair("USDC", "INJ");
    await tradePage.enterAmount("0.2");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap INJ to USDC", async () => {
    await tradePage.selectPair("INJ", "USDC");
    await tradePage.enterAmount("0.01");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap USDC to AKT", async () => {
    await tradePage.selectPair("USDC", "AKT");
    await tradePage.enterAmount("0.1");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });

  test("User should be able to swap AKT to USDC", async () => {
    await tradePage.selectPair("AKT", "USDC");
    await tradePage.enterAmount("0.025");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
  });
});
