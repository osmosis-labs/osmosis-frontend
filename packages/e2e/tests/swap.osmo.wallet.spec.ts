import { type BrowserContext, expect, test } from "@playwright/test";

import { TradePage } from "../pages/trade-page";
import { SetupKeplr } from "../setup-keplr";
import { TOKEN_DENOMS, ensureBalances } from "../utils/balance-checker";
import { notice } from "../utils/github-notice";
import { getTxReceivedAmount } from "../utils/tx-confirm";
import { deriveAddress } from "../utils/wallet-utils";

// A round trip: the return leg sends back exactly what the outbound leg
// received, so the wallet only pays fees and spread instead of drifting
// further from OSMO into ATOM on every run.
test.describe("Test Swap to/from OSMO feature", () => {
  test.describe.configure({ mode: "serial" });

  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  let address: string;
  let atomReceived = "";

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey);

    ({ address } = await deriveAddress(privateKey));
    await ensureBalances(address, [{ token: "OSMO", amount: 0.2 }]);

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

  test("User should be able to swap OSMO to ATOM", async () => {
    await tradePage.selectPair("OSMO", "ATOM");
    await tradePage.enterAmount("0.2");
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
    const txUrl = await tradePage.getTransactionUrl();
    atomReceived = await getTxReceivedAmount(
      txUrl,
      address,
      TOKEN_DENOMS.ATOM.denom,
      TOKEN_DENOMS.ATOM.decimals
    );
    console.log(`Received ${atomReceived} ATOM.`);
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    expect(atomReceived, "The OSMO to ATOM leg did not run.").not.toBe("");
    await tradePage.selectPair("ATOM", "OSMO");
    await tradePage.enterAmount(atomReceived);
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context, {
      maxRetries: 3,
      slippagePercent: "3",
    });
    await tradePage.getTransactionUrl();
  });
});
