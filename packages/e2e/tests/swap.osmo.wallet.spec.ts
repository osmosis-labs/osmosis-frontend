import * as core from "@actions/core";
import { type BrowserContext, expect, test } from "@playwright/test";
import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { ensureBalances } from "../utils/balance-checker";
import { deriveAddress } from "../utils/wallet-utils";

test.describe("Test Swap to/from OSMO feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const _ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    const { address } = await deriveAddress(privateKey);
    await ensureBalances(address, [
      { token: "OSMO", amount: 0.2 }, // Max needed in single test
      { token: "ATOM", amount: 0.01 }, // Max needed in single test
    ]);

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

  test.skip("User should be able to swap OSMO to WBTC", async () => {
    await tradePage.selectPair("OSMO", "WBTC");
    await tradePage.enterAmount("0.9");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("denom: uosmo");
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap OSMO to ATOM", async () => {
    await tradePage.selectPair("OSMO", "ATOM");
    await tradePage.enterAmount("0.2");
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
    //expect(msgContent).toContain(`token_out_denom: ${ATOM}`);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("denom: uosmo");
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    await tradePage.selectPair("ATOM", "OSMO");
    await tradePage.enterAmount("0.01");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
    //expect(msgContent).toContain(`denom: ${ATOM}`);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("token_out_denom: uosmo");
    await tradePage.getTransactionUrl();
  });
});
