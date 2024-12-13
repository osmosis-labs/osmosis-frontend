import { type BrowserContext, chromium, expect, test } from "@playwright/test";

import { TestConfig } from "../test-config";
import { UnzipExtension } from "../unzip-extension";

import { WalletPage } from "../pages/keplr-page";
import { TradePage } from "../pages/trade-page";

test.describe("Test Swap to/from OSMO feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1qyc8u7cn0zjxcu9dvrjz5zwfnn0ck92v62ak9l";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension();
    console.log("\nSetup Wallet Extension before tests.");
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension)
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Swaps");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.skip("User should be able to swap OSMO to WBTC", async () => {
    await tradePage.goto();
    await tradePage.selectPair("OSMO", "WBTC");
    await tradePage.enterAmount("0.9");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap OSMO to ATOM", async () => {
    await tradePage.goto();
    await tradePage.selectPair("OSMO", "ATOM");
    await tradePage.enterAmount("0.2");
    await tradePage.swapAndApprove(context);
    //expect(msgContent).toContain(`token_out_denom: ${ATOM}`);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to swap ATOM to OSMO", async () => {
    await tradePage.goto();
    await tradePage.selectPair("ATOM", "OSMO");
    await tradePage.enterAmount("0.01");
    await tradePage.showSwapInfo();
    await tradePage.swapAndApprove(context);
    //expect(msgContent).toContain(`denom: ${ATOM}`);
    //expect(msgContent).toContain(`sender: ${walletId}`);
    //expect(msgContent).toContain("token_out_denom: uosmo");
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });
});
