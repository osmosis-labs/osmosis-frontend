/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { SwapPage } from "../pages/swap-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Swap feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let swapPage: SwapPage;

  test.beforeEach(async () => {
    console.log(
      "Before tests setup Wallet Extension. This will be extracted to a separate fixture"
    );
    // Launch Chrome with a Keplr wallet extension
    const extensionId = "ibomioleaahcoaakgginocklpgejhmen";
    const pathToExtension = path.join(__dirname, "../keplr-extension");
    console.log("pathToExtension" + pathToExtension);
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const page = await context.newPage();
    const walletPage = new WalletPage(page);
    await walletPage.goto(extensionId);
    // Import existing Wallet (also could be aggregated in one function.
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test", password);
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    swapPage = new SwapPage(await context.newPage());
    await swapPage.goto();
    // This is needed to handle a wallet popup
    const pagePromise = context.waitForEvent("page");
    await swapPage.connectWallet(pagePromise);
  });

  test("New User should be able to swap OSMO to ATOM", async () => {
    await swapPage.selectPair("OSMO", "ATOM");
    await swapPage.swap("0.01");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(
      "token_out_denom: ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("amount: '10000'");
    expect(msgContentAmount).toContain("denom: uosmo");
  });

  test("New User should be able to swap ATOM to OSMO", async () => {
    await swapPage.selectPair("ATOM", "OSMO");
    await swapPage.swap("0.001");
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    const { msgContentAmount } = await swapPage.getWalletMsg(pageApprove);
    // Handle Pop-up page <-
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(
      "denom: ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("amount: '1000'");
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
  });
});
