import { type BrowserContext, expect, test } from "@playwright/test";

import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { TOKEN_DENOMS, ensureBalances } from "../utils/balance-checker";
import { notice } from "../utils/github-notice";
import { getTxReceivedAmount } from "../utils/tx-confirm";
import { deriveAddress } from "../utils/wallet-utils";

// Round trips from USDC: each return leg sends back exactly what its outbound
// leg received, so the wallet only pays fees and spread. PR runs
// check one pair; the rest run in the full suite (@full), since they exercise
// the same swap path with a different token.
const ROUND_TRIPS = [
  { token: "TIA", usdcAmount: "0.1", fullOnly: false },
  { token: "ATOM", usdcAmount: "0.1", fullOnly: true },
  { token: "INJ", usdcAmount: "0.2", fullOnly: true },
  { token: "AKT", usdcAmount: "0.1", fullOnly: true },
] as const;

test.describe("Test Swap to/from USDC feature", () => {
  test.describe.configure({ mode: "serial" });

  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  let address: string;
  const received: Record<string, string> = {};

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    ({ address } = await deriveAddress(privateKey));
    await ensureBalances(address, [{ token: "USDC", amount: 0.2 }]);

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
      notice(`Test ${name} failed.`);
    }
  });

  for (const { token, usdcAmount, fullOnly } of ROUND_TRIPS) {
    const tag = fullOnly ? " @full" : "";

    test(`User should be able to swap USDC to ${token}${tag}`, async () => {
      await tradePage.selectPair("USDC", token);
      await tradePage.enterAmount(usdcAmount);
      await tradePage.showSwapInfo();
      await tradePage.swapAndApprove(context, {
        maxRetries: 3,
        slippagePercent: "3",
      });
      const txUrl = await tradePage.getTransactionUrl();
      const { denom, decimals } = TOKEN_DENOMS[token];
      received[token] = await getTxReceivedAmount(
        txUrl,
        address,
        denom,
        decimals
      );
      console.log(`Received ${received[token]} ${token}.`);
    });

    test(`User should be able to swap ${token} to USDC${tag}`, async () => {
      expect(
        received[token],
        `The USDC to ${token} leg did not run.`
      ).toBeTruthy();
      await tradePage.selectPair(token, "USDC");
      await tradePage.enterAmount(received[token]);
      await tradePage.showSwapInfo();
      await tradePage.swapAndApprove(context, {
        maxRetries: 3,
        slippagePercent: "3",
      });
      await tradePage.getTransactionUrl();
    });
  }
});
